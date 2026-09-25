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
export const fetchCompanyData = asyncHandler(async (req, res) => {
  const { companyName } = req.body;

  if (!companyName) {
    throw new ApiError(400, 'Company name is required');
  }

  let companyData = {
    name: companyName,
    logo: '',
    website: '',
    description: '',
    linkedin: '',
    facebook: '',
    careersUrl: '',
  };

  // ── Step 1: Wikipedia search for description + official website ────────────
  try {
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName)}&format=json&origin=*`;
    const wikiSearchRes = await axios.get(wikiSearchUrl, { timeout: 7000 });
    const searchResults = wikiSearchRes.data?.query?.search || [];

    if (searchResults.length > 0) {
      const pageTitle = searchResults[0].title;

      // Fetch the page summary (description + website)
      const wikiSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
      const wikiSummaryRes = await axios.get(wikiSummaryUrl, { timeout: 7000 });
      const wikiData = wikiSummaryRes.data;

      if (wikiData.extract) {
        // Trim to 2 sentences max for a short description
        const sentences = wikiData.extract.split('. ');
        companyData.description = sentences.slice(0, 2).join('. ').trim();
        if (!companyData.description.endsWith('.')) companyData.description += '.';
      }

      // Try to get official website from Wikipedia page properties
      try {
        const wikiPropsUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extlinks&ellimit=20&format=json&origin=*`;
        const wikiPropsRes = await axios.get(wikiPropsUrl, { timeout: 5000 });
        const pages = wikiPropsRes.data?.query?.pages || {};
        const pageData = Object.values(pages)[0];
        const extLinks = pageData?.extlinks || [];

        // Find the official company domain (prefer .com links)
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

  // ── Step 2: DuckDuckGo Instant Answer for website if still missing ─────────
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

      // Pick official URL from related topics
      if (ddgData.AbstractURL) {
        companyData.website = ddgData.AbstractURL;
      }
    } catch (ddgErr) {
      console.error('DuckDuckGo fetch error:', ddgErr.message);
    }
  }

  // ── Step 3: Derive logo from website domain using Google Favicon ──────────
  if (companyData.website) {
    try {
      const domain = new URL(companyData.website).hostname;
      companyData.logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (_) {}
  }

  // ── Step 4: Scrape official website for social + careers links ────────────
  if (companyData.website) {
    try {
      const htmlRes = await axios.get(companyData.website, {
        timeout: 7000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        maxRedirects: 5,
      });

      const $ = cheerio.load(htmlRes.data);

      // Better description from meta if we still don't have one
      if (!companyData.description) {
        const metaDesc = $('meta[name="description"]').attr('content') ||
                         $('meta[property="og:description"]').attr('content') || '';
        companyData.description = metaDesc.trim();
      }

      // Social & career links
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('linkedin.com/company/') && !companyData.linkedin) {
          companyData.linkedin = href.startsWith('http') ? href : `https://linkedin.com${href}`;
        }
        if (href.includes('facebook.com/') && !href.includes('share') && !companyData.facebook) {
          companyData.facebook = href.startsWith('http') ? href : `https://facebook.com${href}`;
        }
        if (!companyData.careersUrl && (href.toLowerCase().includes('career') || href.toLowerCase().includes('/jobs'))) {
          if (href.startsWith('http')) {
            companyData.careersUrl = href;
          } else if (href.startsWith('/')) {
            companyData.careersUrl = `${companyData.website.replace(/\/$/, '')}${href}`;
          }
        }
      });
    } catch (scrapeErr) {
      console.error('Website scrape error:', scrapeErr.message);
    }
  }

  res.json(new ApiResponse(200, companyData, 'Company data fetched successfully'));
});
