import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'

import { api } from '@/convex/_generated/api'

export default function DashboardBanner() {
  const [content, setContent] = useState("Become the master you already are...right now, in this moment. It is the truth that you are already perfect. Surrender to this truth. You are what you think.")

  // const getBanner = useMutation(api.banners.get)

  // useEffect(() => {
  //   async function fetchBanner() {
  //     const result = await getBanner();
  //     result && setContent(result.content);
  //   }
  //   fetchBanner();
  // }, [getBanner]);

  return (
    <div className="w-full border-2 p-4 text-xl italic">
      <h1>{content}</h1>
    </div>
  )
}
