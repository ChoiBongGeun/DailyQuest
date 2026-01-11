// frontend/app/page.tsx
export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                {/* 헤더 */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        DailyQuest 🎯
                    </h1>
                    <p className="text-xl text-gray-600">
                        매일의 퀘스트를 완료하세요!
                    </p>
                </div>

                {/* 개발 상태 */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <StatusCard
                        title="Frontend"
                        status="Running"
                        icon="⚛️"
                        tech="Next.js 16 + React 19"
                    />
                    <StatusCard
                        title="Backend"
                        status="Running"
                        icon="🍃"
                        tech="Spring Boot 3.5.9"
                    />
                    <StatusCard
                        title="Database"
                        status="Running"
                        icon="🐘"
                        tech="PostgreSQL 15"
                    />
                </div>

                {/* 기술 스택 */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                        기술 스택
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <TechStack
                            title="Frontend"
                            items={[
                                "React 19",
                                "Next.js 16",
                                "TypeScript",
                                "Zustand",
                                "React Query",
                                "Tailwind CSS 4"
                            ]}
                        />
                        <TechStack
                            title="Backend"
                            items={[
                                "Spring Boot 3.5.9",
                                "Java 17",
                                "PostgreSQL 15",
                                "Spring Security",
                                "JWT"
                            ]}
                        />
                    </div>
                </div>

                {/* 푸터 */}
                <div className="text-center mt-12 text-gray-600">
                    <p>Powered by Yarn 🧶</p>
                </div>
            </div>
        </div>
    );
}

// 컴포넌트들
function StatusCard({ title, status, icon, tech }: {
    title: string;
    status: string;
    icon: string;
    tech: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-600 font-medium">{status}</span>
            </div>
            <p className="text-sm text-gray-600">{tech}</p>
        </div>
    );
}

function TechStack({ title, items }: {
    title: string;
    items: string[];
}) {
    return (
        <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-800">{title}</h3>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                        <span className="text-blue-500">▸</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}