export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tutorials & Guides</h1>
            <p className="text-muted-foreground">
              Learn how to make the most of SkillLoop with our comprehensive
              tutorials
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Getting Started</h2>
              <ul className="space-y-2 text-sm">
                <li>• How to connect your wallet</li>
                <li>• Setting up your profile</li>
                <li>• Understanding SKL tokens</li>
                <li>• Finding your first tutor</li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">For Students</h2>
              <ul className="space-y-2 text-sm">
                <li>• How to book a session</li>
                <li>• Creating learning requests</li>
                <li>• Managing your sessions</li>
                <li>• Earning certificates</li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">For Tutors</h2>
              <ul className="space-y-2 text-sm">
                <li>• Becoming a tutor</li>
                <li>• Setting your rates</li>
                <li>• Managing session requests</li>
                <li>• Building your reputation</li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Advanced Features</h2>
              <ul className="space-y-2 text-sm">
                <li>• Progress tracking</li>
                <li>• NFT certificates</li>
                <li>• Review system</li>
                <li>• Token economics</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              More detailed tutorials coming soon!
            </p>
            <p className="text-sm text-muted-foreground">
              Have questions? Check out our{" "}
              <a href="/faq" className="text-primary hover:underline">
                FAQ
              </a>{" "}
              or contact{" "}
              <a href="/support" className="text-primary hover:underline">
                support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
