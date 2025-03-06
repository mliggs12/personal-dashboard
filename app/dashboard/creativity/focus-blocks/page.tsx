
export default function FocusBlocksPage() {
  return (
    <div className="flex flex-col min-h-full justify-center items-center">
      <h2 className="title prose dark:prose-invert text-3xl font-semibold">Focus Block</h2>

      <div className="focus-block flex flex-col h-[1050px] w-[850px] p-2">
        <div className="header grid grid-cols-12 items-center">
          <div className="question col-span-3 dark:prose-invert font-semibold prose text-base pl-1">What is bothering me?</div>
          <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center border border-b-0 px-1">I do not have enough time to do everything that I want</div>
          <div className="question col-span-3 dark:prose-invert font-semibold prose text-base pl-1">How do I want to feel instead?</div>
          <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center border border-b-0 px-1">I want to feel like I have all the time in the world, to do whatever I want</div>
        </div>

        <div className="body border border-b-0">
          <ol>
            {[...Array(12)].map((_, i) => (
              <li key={i} className="grid grid-cols-12 h-14 items-center justify-end border-b last:border-b-0">
                <div className="index col-start-3 prose dark:prose-invert text-3xl font-semibold">{i + 1}</div>
                <div className="statement col-span-9 prose dark:prose-invert text-base px-1">Every day is chained to the next so even a tiny vibrational improvement in one day carries forward to the next day</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="footer grid grid-cols-12 items-center border ">
          <div className="question flex col-span-3 font-medium prose dark:prose-invert items-center text-center text-sm text-primary bg-secondary/75 h-full mr-1">
            <div className="w-[148px] ml-4">Best-Feeling Thought From This Block</div>
          </div>
          <div className="statement col-span-9 prose dark:prose-invert flex h-14 items-center text-base px-1">If I just find the feeling of what I want then the action part will take care of itself automatically</div>
        </div>
      </div>

    </div>
  )
}
