
export default function IntroScreen({ seconds = 10, onDone }) {

    return (
        <div className="h-screen bg-white text-gray-900 grid place-items-center overflow-hidden font-sans">
            {/* Main content */}
            <div className="max-w-[960px] w-full text-center px-6">
                <div className="text-[56px] font-extrabold mb-2.5">
                    Hi, I'm Steve,
                    Jonah and Isaiah's dad! 👋
                </div>

                <div className="text-[34px] font-bold mb-4">
                    I'm a software engineer at Dave
                </div>

                <div className="text-[26px] leading-[1.3] mb-[26px]">
                    We build an app that helps grown-ups take care of their money.
                    <br />
                    Today, you'll help me tell a computer what to do —
                    just like real software engineers do!
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => onDone?.()}
                        className="text-[22px] px-[22px] py-3.5 rounded-[14px] border-2 border-gray-900 bg-white text-gray-900 cursor-pointer font-extrabold"
                    >
                        Start (Enter / Space)
                    </button>

                </div>

            </div>
        </div>
    );
}
