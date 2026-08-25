export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    }}
    type="application/ld+json"
  />
)
