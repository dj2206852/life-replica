export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-xl">
        <h1 className="text-4xl font-bold mb-4">Life Replica</h1>
        <p className="text-lg text-gray-700 mb-6">
          Preserve your story. Let your loved ones connect with a digital memory of you.
        </p>
        <a href="/interview" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-lg">
          Start Your Interview
        </a>
      </div>
    </main>
  );
}