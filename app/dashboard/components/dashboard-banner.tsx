import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'

export default function DashboardBanner() {
  const [content, setContent] = useState("Banner content goes here.")

  const getBanner = useMutation(api.banners.get)

  useEffect(() => {
    async function fetchBanner() {
      const result = await getBanner();
      result && setContent(result.content);
    }
    fetchBanner();
  }, [getBanner]);

  return (
    <div className="w-full border-2 p-4 text-2xl">
      <h1>{content}</h1>
    </div>
  )
}
