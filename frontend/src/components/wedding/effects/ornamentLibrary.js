const assets = import.meta.glob('../../../assets/wedding/ornaments/**/*.svg', {
  eager: true,
  query: '?url&no-inline',
  import: 'default',
})
export const ornamentLibrary = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [
    path.split('/').slice(-2).join('/').replace('.svg', ''),
    url,
  ]),
)
export function ornamentAsset(family, name) {
  return (
    ornamentLibrary[`${family}/${name}`] || ornamentLibrary['modern/geometry']
  )
}
