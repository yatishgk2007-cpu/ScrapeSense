const BRIGHT_DATA_API_TOKEN = process.env.BRIGHT_DATA_API_TOKEN || '';
const DATASET_ID =
  process.env.BRIGHT_DATA_DATASET_ID || 'gd_l7q7dkf244hwjntr0';

const TARGET_URL =
  process.env.TARGET_URL || 'https://www.amazon.com/dp/B0BSHF7WHW';

async function runCollector(url = TARGET_URL) {
  if (!BRIGHT_DATA_API_TOKEN) {
    return {
      success: false,
      error: 'BRIGHT_DATA_API_TOKEN is not set.'
    };
  }

  try {
    const response = await fetch(
      `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${DATASET_ID}&notify=false&include_errors=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BRIGHT_DATA_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: [
            {
              url,
              zipcode: '94107',
              language: ''
            }
          ]
        })
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error('[BrightData] API error:', text);

      return {
        success: false,
        error: `Bright Data API returned ${response.status}`,
        raw: text
      };
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: 'Could not parse Bright Data response',
        raw: text
      };
    }

    console.log('[BrightData] Amazon scrape completed successfully.');

    return {
      success: true,
      source: 'Bright Data',
      data
    };
  } catch (error) {
    console.error('[BrightData] Request failed:', error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  runCollector,
  DATASET_ID,
  TARGET_URL
};