export default function RightSidebar() {
  return (
    <aside className="w-[312px] hidden xl:block shrink-0 mt-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-4 shadow-sm">
        <div className="bg-blue-600 h-10 w-full"></div>
        <div className="p-3">
          <div className="flex items-center gap-3 -mt-6 mb-3">
            <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-zinc-900">
              J
            </div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 pt-5">
              About jobbanai
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
            Welcome to jobbanai! The front page of tech talent. Discover opportunities, pitch your startup, and connect with other builders.
          </p>
          <div className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300 mb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <div>
              <div className="font-bold">12.5k</div>
              <div className="text-zinc-500 text-xs">Members</div>
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                142
              </div>
              <div className="text-zinc-500 text-xs">Online</div>
            </div>
          </div>
          <button className="w-full bg-[#FF4500] hover:bg-[#E03D00] text-white font-bold py-1.5 px-4 rounded-full transition-colors mb-2">
            Join
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm text-sm">
        <h3 className="font-bold text-zinc-500 uppercase text-xs mb-3">Rules</h3>
        <ol className="list-decimal pl-4 space-y-2 text-zinc-700 dark:text-zinc-300">
          <li className="pb-2 border-b border-zinc-100 dark:border-zinc-800">Be respectful to other builders.</li>
          <li className="pb-2 border-b border-zinc-100 dark:border-zinc-800">No spam or low-effort pitches.</li>
          <li>Include relevant tags in your posts.</li>
        </ol>
      </div>
    </aside>
  );
}
