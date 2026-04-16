// src/lib/shopify.js

/**
 * Fetch products from a Shopify store using the Storefront API.
 * @param {string} storeDomain  e.g. "mystore.myshopify.com"
 * @param {string} accessToken  Storefront API access token (public/read-only)
 * @returns {Promise<Array>}  array of { id, title, price, currency, image }
 */
export async function fetchShopifyProducts(storeDomain, accessToken) {
  const domain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const url = `https://${domain}/api/2024-01/graphql.json`

  const query = `{
    products(first: 20) {
      edges {
        node {
          id
          title
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
        }
      }
    }
  }`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`Store connection failed (${res.status}). Check your domain and token.`)

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'Shopify API error')
  if (!json.data) throw new Error('Invalid response from store')

  return json.data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    price: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2),
    currency: node.priceRange.minVariantPrice.currencyCode,
    image: node.images.edges[0]?.node?.url || null,
  }))
}
