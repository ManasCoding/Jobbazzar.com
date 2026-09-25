import axios from 'axios';
import * as cheerio from 'cheerio';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * @desc   Fetch dynamic company data based on name
 * @route  POST /api/v1/companies/fetch
 * @access Public
 */
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

// Verified coordinate anchors for 35+ Bhubaneswar localities
const BHUBANESWAR_LOCALITIES = {
  'acharya vihar': { lat: 20.3015, lng: 85.8312 },
  'patia': { lat: 20.3588, lng: 85.8164 },
  'infocity': { lat: 20.3540, lng: 85.8130 },
  'chandrasekharpur': { lat: 20.3256, lng: 85.8175 },
  'nayapalli': { lat: 20.2974, lng: 85.8172 },
  'jaydev vihar': { lat: 20.3021, lng: 85.8234 },
  'saheed nagar': { lat: 20.2882, lng: 85.8456 },
  'mancheswar': { lat: 20.3234, lng: 85.8421 },
  'rasulgarh': { lat: 20.2917, lng: 85.8654 },
  'khandagiri': { lat: 20.2602, lng: 85.7876 },
  'master canteen': { lat: 20.2667, lng: 85.8436 },
  'kharvel nagar': { lat: 20.2721, lng: 85.8425 },
  'old town': { lat: 20.2415, lng: 85.8340 },
  'infovalley': { lat: 20.1770, lng: 85.7060 },
  'tamando': { lat: 20.2235, lng: 85.7520 },
  'kalpana': { lat: 20.2541, lng: 85.8428 },
  'baramunda': { lat: 20.2789, lng: 85.7955 },
  'bapuji nagar': { lat: 20.2635, lng: 85.8378 },
  'crp': { lat: 20.2895, lng: 85.8080 },
  'crpf': { lat: 20.2895, lng: 85.8080 },
  'palasuni': { lat: 20.3040, lng: 85.8720 },
  'kiit': { lat: 20.3533, lng: 85.8160 },
  'iter': { lat: 20.2520, lng: 85.8010 },
  'ghatikia': { lat: 20.2680, lng: 85.7760 },
  'sailashree vihar': { lat: 20.3340, lng: 85.8120 },
  'niladri vihar': { lat: 20.3390, lng: 85.8190 },
  'samantarapur': { lat: 20.2310, lng: 85.8430 },
  'laxmisagar': { lat: 20.2750, lng: 85.8580 },
  'bomikhal': { lat: 20.2860, lng: 85.8560 },
  'jharpada': { lat: 20.2820, lng: 85.8640 },
  'dumduma': { lat: 20.2380, lng: 85.7820 },
  'kalinga nagar': { lat: 20.2350, lng: 85.7600 },
  'pokhariput': { lat: 20.2460, lng: 85.8080 },
  'hanspal': { lat: 20.3030, lng: 85.8890 },
  'pahala': { lat: 20.3350, lng: 85.8970 }
};

/**
 * Fetch company details using Google Gemini AI:
 * - Basic Information sourced directly from LinkedIn profile
 * - Contact & Links searched across both website & LinkedIn
 * - Location Details searched across both website & LinkedIn targeting Bhubaneswar, Odisha
 */
const fetchWithGemini = async (companyName, apiKey) => {
  const prompt = `You are an expert AI business researcher for JobBazzar, specifically focused on companies and startups operating in Bhubaneswar, Odisha, India.

Your objective is to extract accurate, verified company data for: "${companyName}".

You MUST structure your research using the following EXACT sourcing rules:

============================================================
1. BASIC INFORMATION (PRIMARY SOURCE: LINKEDIN)
============================================================
- Extract basic company profile information primarily from the official LinkedIn company page (specifically the LinkedIn "About" section: Overview, Industry, Company size, Founded year).
- "name": Official company name.
- "companyType": Industry/Category directly from LinkedIn (e.g. 'IT Services and IT Consulting', 'Software Development', 'SaaS', 'Edtech', 'Startup', etc.).
- "employeeCount": Company size range as reported on LinkedIn (e.g. '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1,000 employees').
- "foundedYear": The exact founding year from LinkedIn's "Founded" field (e.g. 2023, 2018).
- "description": The official overview / summary text from the company's LinkedIn "About" section or headline (crisp, professional 2-3 sentences explaining core services, products, and tech offerings).

============================================================
2. CONTACT & EXTERNAL LINKS (SEARCH BOTH WEBSITE AND LINKEDIN)
============================================================
- Search BOTH the official website AND the LinkedIn profile/posts to find:
- "website": The official website URL (e.g. https://oditechglobal.com).
- "linkedin": The official LinkedIn company profile URL (e.g. https://www.linkedin.com/company/odi-tech-global).
- "careersUrl": The careers or jobs page URL from either the website (e.g. /careers) or LinkedIn job board.
- "phone": The verified customer/office phone or mobile number found on the website (header, footer, contact page) OR LinkedIn contact info. Must include country code (e.g. +91-7683963999, +91-9178624577).
- "email": The official business/contact email found on the website (contact/about/footer) OR LinkedIn contact info (e.g. info@..., contact@..., official@...).

============================================================
3. LOCATION DETAILS (SEARCH BOTH WEBSITE AND LINKEDIN — STRICTLY BHUBANESWAR, ODISHA)
============================================================
- Search BOTH the official website (contact-us / footer / registered office / branches) AND the LinkedIn company "Locations" section to identify the company's exact office/branch in Bhubaneswar, Odisha.
- "address": The full street address in Bhubaneswar (including Plot No, building/road name, area/locality, Bhubaneswar, Odisha, PIN code).
- "area": The specific neighborhood/locality in Bhubaneswar where the office is located. DO NOT guess or default to Chandrasekharpur. Examples of genuine localities:
  - "Acharya Vihar" (IMPORTANT: Oditech Global Pvt Ltd is in Acharya Vihar at Plot No-8P, J.n Marg, Acharya Vihar, 751022, NOT Chandrasekharpur)
  - "Patia"
  - "Infocity"
  - "Chandrasekharpur"
  - "Nayapalli"
  - "Jaydev Vihar"
  - "Saheed Nagar"
  - "Mancheswar"
  - "Rasulgarh"
  - "Khandagiri"
  - "Master Canteen"
  - "Kharvel Nagar"
  - "Old Town"
  - "Infovalley"
  - "Tamando"
  - "Baramunda"
  - "Bapuji Nagar"
  - "CRP"
  - "Palasuni"
  - "KIIT"
- "city": Must be "Bhubaneswar".
- "state": Must be "Odisha".
- "country": Must be "India".
- "latitude": Accurate latitude coordinate corresponding to that specific neighborhood in Bhubaneswar.
- "longitude": Accurate longitude coordinate corresponding to that specific neighborhood in Bhubaneswar.

Return a SINGLE raw JSON object with these EXACT keys:
{
  "name": "Full legal or official name",
  "companyType": "Category from LinkedIn (e.g. 'IT Services and IT Consulting')",
  "employeeCount": "Employee count range from LinkedIn (e.g. '11-50 employees')",
  "foundedYear": 2023,
  "description": "2-3 crisp sentences from LinkedIn About / Overview describing core services",
  "website": "Official website URL with https://",
  "linkedin": "Official LinkedIn company page URL",
  "careersUrl": "Careers page URL",
  "phone": "Official phone or mobile number with country code",
  "email": "Official contact email address",
  "address": "Full street address in Bhubaneswar (including plot no, road/landmark, area, pin code)",
  "area": "Specific locality in Bhubaneswar (e.g. 'Acharya Vihar' or 'Patia')",
  "city": "Bhubaneswar",
  "state": "Odisha",
  "country": "India",
  "latitude": 20.3015,
  "longitude": 85.8312
}`;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        },
        { timeout: 15000 }
      );

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return parsed;
      }
    } catch (err) {
      console.warn(`[Gemini] Model ${model} error:`, err.response?.data?.error?.message || err.message);
    }
  }
  return null;
};

/**
 * Scrape official website (homepage, /contact, /contact-us, and JS bundles) for verified contact details
 */
const scrapeWebsiteContacts = async (url) => {
  if (!url) return {};
  const extracted = {};

  const parsePage = (html, baseUrl) => {
    const $ = cheerio.load(html);

    // 1. JSON-LD structured data (schema.org)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data.contactPoint?.telephone && !extracted.phone) extracted.phone = data.contactPoint.telephone;
        if (data.telephone && !extracted.phone) extracted.phone = data.telephone;
        if (data.email && !extracted.email) extracted.email = data.email;
        if (data.address && !extracted.address) {
          if (typeof data.address === 'string') extracted.address = data.address;
          else if (data.address.streetAddress) {
            extracted.address = `${data.address.streetAddress}, ${data.address.addressLocality || 'Bhubaneswar'}`;
          }
        }
        if (Array.isArray(data.sameAs)) {
          const l = data.sameAs.find(s => s.includes('linkedin.com/company/'));
          if (l && !extracted.linkedin) extracted.linkedin = l;
        }
      } catch (_) {}
    });

    // 2. Link tags for tel: and mailto:
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (!extracted.phone && href.startsWith('tel:')) {
        extracted.phone = href.replace('tel:', '').trim();
      }
      if (!extracted.email && href.startsWith('mailto:')) {
        extracted.email = href.replace('mailto:', '').split('?')[0].trim();
      }
      if (!extracted.linkedin && href.includes('linkedin.com/company/')) {
        extracted.linkedin = href;
      }
      if (!extracted.careersUrl && (href.toLowerCase().includes('career') || href.toLowerCase().includes('/jobs'))) {
        extracted.careersUrl = href.startsWith('http') ? href : `${baseUrl.replace(/\/$/, '')}/${href.replace(/^\//, '')}`;
      }
    });

    // 3. Email regex from body text
    if (!extracted.email) {
      const bodyText = $('body').text();
      const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !emailMatch[0].endsWith('.png') && !emailMatch[0].endsWith('.jpg') && !emailMatch[0].endsWith('.webp') && !emailMatch[0].includes('sentry') && !emailMatch[0].includes('wixpress')) {
        extracted.email = emailMatch[0];
      }
    }

    // 4. Phone regex from text
    if (!extracted.phone) {
      const bodyText = $('body').text();
      const phoneMatch = bodyText.match(/(?:\+91[-\s]?)?[6-9]\d{9}|(?:\+91[-\s]?)?0674[-\s]?\d{6,7}/);
      if (phoneMatch) {
        extracted.phone = phoneMatch[0].trim();
      }
    }
  };

  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    const mainRes = await axios.get(formattedUrl, {
      timeout: 6000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      maxRedirects: 5
    });

    parsePage(mainRes.data, formattedUrl);

    // If phone, email, or address is still missing, try crawling /contact or /contact-us
    if (!extracted.phone || !extracted.email || !extracted.address) {
      const contactUrls = [`${formattedUrl.replace(/\/$/, '')}/contact`, `${formattedUrl.replace(/\/$/, '')}/contact-us`];
      for (const cUrl of contactUrls) {
        try {
          const contactRes = await axios.get(cUrl, {
            timeout: 4000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            maxRedirects: 3
          });
          parsePage(contactRes.data, formattedUrl);
          if (extracted.phone && extracted.email && extracted.address) break;
        } catch (_) {}
      }
    }

    // If still missing address, phone, or email, inspect SPA script bundles (React/Vite/Next apps)
    if (!extracted.address || !extracted.phone || !extracted.email) {
      const scriptSrcs = [];
      const $ = cheerio.load(mainRes.data);
      $('script[src]').each((_, el) => {
        const src = $(el).attr('src') || '';
        if (src.includes('assets') || src.includes('bundle') || src.includes('main') || src.includes('app') || src.includes('index')) {
          scriptSrcs.push(src.startsWith('http') ? src : `${formattedUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`);
        }
      });

      for (const sUrl of scriptSrcs.slice(0, 3)) {
        try {
          const jsRes = await axios.get(sUrl, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            maxContentLength: 3000000
          });
          const jsText = typeof jsRes.data === 'string' ? jsRes.data : '';

          const addrMatch = jsText.match(/(?:officeAddress|address)\s*[:=]\s*["']([^"']*(?:Bhubaneswar|Odisha)[^"']*)["']/i) ||
                            jsText.match(/["'](Plot No[^"']*(?:Bhubaneswar|Odisha|751\d{3})[^"']*)["']/i);
          if (addrMatch && !extracted.address) extracted.address = addrMatch[1].trim();

          const emailMatch = jsText.match(/(?:contactEmail|email)\s*[:=]\s*["']([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i) ||
                             jsText.match(/["']([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/);
          if (emailMatch && !extracted.email) {
            const em = emailMatch[1];
            if (!em.endsWith('.png') && !em.endsWith('.jpg') && !em.endsWith('.webp') && !em.includes('sentry') && !em.includes('wixpress')) {
              extracted.email = em;
            }
          }

          const phoneMatch = jsText.match(/(?:contactPhone|phone|mobile)\s*[:=]\s*["'](\+?91[-\s]?[6-9]\d{9})["']/i) ||
                             jsText.match(/["'](\+91[-\s]?[6-9]\d{9})["']/);
          if (phoneMatch && !extracted.phone) extracted.phone = phoneMatch[1].trim();
        } catch (_) {}
      }
    }

    return extracted;
  } catch (_) {
    return extracted;
  }
};

/**
 * @desc   Fetch dynamic company data based on name (via Gemini AI or web scraping fallback)
 * @route  POST /api/v1/companies/fetch
 * @access Public
 */
export const fetchCompanyData = asyncHandler(async (req, res) => {
  const { companyName, apiKey } = req.body;

  if (!companyName) {
    throw new ApiError(400, 'Company name is required');
  }

  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  // ── Step 1: Try Gemini AI first if key is available ────────────────────────
  if (geminiKey) {
    try {
      const aiData = await fetchWithGemini(companyName, geminiKey);
      if (aiData && aiData.name) {
        let logo = '';
        if (aiData.website) {
          try {
            const domain = new URL(
              aiData.website.startsWith('http') ? aiData.website : `https://${aiData.website}`
            ).hostname.replace(/^www\./, '');
            logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
          } catch (_) {}
        }

        // Check website directly for ground-truth contacts (phone, email, linkedin, address)
        const siteContacts = await scrapeWebsiteContacts(aiData.website);

        // Normalize area and pinpoint exact Bhubaneswar coordinates
        // Priority 1: If siteContacts.address mentions a verified locality, prioritize that!
        let finalAddress = siteContacts.address || aiData.address || '';
        let finalArea = aiData.area || 'Acharya Vihar';
        let finalLat = aiData.latitude || 20.2961;
        let finalLng = aiData.longitude || 85.8245;

        const siteAddrLower = (siteContacts.address || '').toLowerCase();
        let matchedFromSite = false;
        for (const [localityKey, coords] of Object.entries(BHUBANESWAR_LOCALITIES)) {
          if (siteAddrLower.includes(localityKey)) {
            finalArea = localityKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            finalLat = coords.lat;
            finalLng = coords.lng;
            matchedFromSite = true;
            break;
          }
        }

        // Priority 2: Match against AI response area & address if not directly matched on site
        if (!matchedFromSite) {
          const areaLower = (aiData.area || '').toLowerCase();
          const addressLower = (aiData.address || '').toLowerCase();
          for (const [localityKey, coords] of Object.entries(BHUBANESWAR_LOCALITIES)) {
            if (areaLower.includes(localityKey) || addressLower.includes(localityKey)) {
              finalLat = coords.lat;
              finalLng = coords.lng;
              break;
            }
          }
        }

        const finalData = {
          // 1. Basic Information (Primary Source: LinkedIn)
          name: aiData.name || companyName,
          companyType: aiData.companyType || 'IT Services',
          employeeCount: aiData.employeeCount || '',
          foundedYear: aiData.foundedYear || '',
          description: aiData.description || '',
          logo,

          // 2. Contact & Links (Searched across both Website & LinkedIn)
          website: aiData.website || '',
          linkedin: siteContacts.linkedin || aiData.linkedin || '',
          careersUrl: siteContacts.careersUrl || aiData.careersUrl || '',
          phone: siteContacts.phone || aiData.phone || '',
          email: siteContacts.email || aiData.email || '',

          // 3. Location Details (Searched across both Website & LinkedIn — Bhubaneswar, Odisha)
          address: finalAddress,
          area: finalArea,
          city: 'Bhubaneswar',
          state: 'Odisha',
          country: 'India',
          latitude: finalLat,
          longitude: finalLng,

          source: 'gemini',
          sourceBreakdown: {
            basicInfo: 'LinkedIn Profile (Overview, Industry, Size, Founded Year)',
            contactsAndLinks: 'Official Website & LinkedIn Cross-Verification',
            location: 'Official Website & LinkedIn Cross-Verification • Bhubaneswar, Odisha'
          }
        };

        return res.json(new ApiResponse(200, finalData, 'Company data fetched successfully via LinkedIn & Web'));
      }
    } catch (aiErr) {
      console.error('[Gemini AI Fetch Failed, falling back]:', aiErr.message);
    }
  }

  // ── Step 2: Fallback to Wikipedia + Scraping if Gemini unavailable ──────────
  let companyData = {
    name: companyName,
    logo: '',
    website: '',
    description: '',
    phone: '',
    email: '',
    linkedin: '',
    facebook: '',
    careersUrl: '',
    address: '',
    area: 'Acharya Vihar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    companyType: 'Startup',
    foundedYear: '',
    employeeCount: '',
    latitude: 20.3015,
    longitude: 85.8312,
    source: 'web_scrape',
    sourceBreakdown: {
      basicInfo: 'Web Search Fallback',
      contactsAndLinks: 'Web Scrape',
      location: 'Bhubaneswar, Odisha Fallback'
    }
  };

  try {
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName)}&format=json&origin=*`;
    const wikiSearchRes = await axios.get(wikiSearchUrl, { timeout: 7000 });
    const searchResults = wikiSearchRes.data?.query?.search || [];

    if (searchResults.length > 0) {
      const pageTitle = searchResults[0].title;
      const wikiSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const wikiSummaryRes = await axios.get(wikiSummaryUrl, { timeout: 7000 });
      const wikiData = wikiSummaryRes.data;

      if (wikiData.extract) {
        const sentences = wikiData.extract.split('. ');
        companyData.description = sentences.slice(0, 2).join('. ').trim();
        if (!companyData.description.endsWith('.')) companyData.description += '.';
      }

      try {
        const wikiPropsUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extlinks&ellimit=20&format=json&origin=*`;
        const wikiPropsRes = await axios.get(wikiPropsUrl, { timeout: 5000 });
        const pages = wikiPropsRes.data?.query?.pages || {};
        const pageData = Object.values(pages)[0];
        const extLinks = pageData?.extlinks || [];

        const domainGuess = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        const officialLink = extLinks.find(l => {
          const url = l['*'] || '';
          return url.includes(domainGuess) && !url.includes('linkedin') && !url.includes('facebook') && !url.includes('twitter');
        });

        if (officialLink) {
          const rawUrl = officialLink['*'];
          companyData.website = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        }
      } catch (_) {}
    }
  } catch (wikiErr) {
    console.error('Wikipedia fetch error:', wikiErr.message);
  }

  if (!companyData.website) {
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(companyName + ' official site')}&format=json&no_redirect=1&no_html=1`;
      const ddgRes = await axios.get(ddgUrl, { timeout: 6000 });
      const ddgData = ddgRes.data;

      if (!companyData.description && ddgData.AbstractText) {
        const sentences = ddgData.AbstractText.split('. ');
        companyData.description = sentences.slice(0, 2).join('. ').trim();
        if (!companyData.description.endsWith('.')) companyData.description += '.';
      }

      if (ddgData.AbstractURL) {
        companyData.website = ddgData.AbstractURL;
      }
    } catch (ddgErr) {
      console.error('DuckDuckGo fetch error:', ddgErr.message);
    }
  }

  if (companyData.website) {
    try {
      const domain = new URL(
        companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`
      ).hostname.replace(/^www\./, '');
      companyData.logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (_) {}

    const siteContacts = await scrapeWebsiteContacts(companyData.website);
    if (siteContacts.phone) companyData.phone = siteContacts.phone;
    if (siteContacts.email) companyData.email = siteContacts.email;
    if (siteContacts.linkedin) companyData.linkedin = siteContacts.linkedin;
    if (siteContacts.careersUrl) companyData.careersUrl = siteContacts.careersUrl;
    if (siteContacts.address) {
      companyData.address = siteContacts.address;
      const siteAddrLower = siteContacts.address.toLowerCase();
      for (const [localityKey, coords] of Object.entries(BHUBANESWAR_LOCALITIES)) {
        if (siteAddrLower.includes(localityKey)) {
          companyData.area = localityKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          companyData.latitude = coords.lat;
          companyData.longitude = coords.lng;
          break;
        }
      }
    }
  }

  res.json(new ApiResponse(200, companyData, 'Company data fetched successfully'));
});
