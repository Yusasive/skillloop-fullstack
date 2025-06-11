export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1>Cookie Policy</h1>
          <p>Last updated: April 1, 2024</p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files that are stored on your device when you
            visit our website. They help us provide you with a better experience
            by remembering your preferences and improving our services.
          </p>

          <h2>How We Use Cookies</h2>
          <p>SkillLoop uses cookies for the following purposes:</p>

          <h3>Essential Cookies</h3>
          <ul>
            <li>Authentication and security</li>
            <li>Wallet connection state</li>
            <li>Session management</li>
            <li>Basic site functionality</li>
          </ul>

          <h3>Functional Cookies</h3>
          <ul>
            <li>User preferences (theme, language)</li>
            <li>Form data persistence</li>
            <li>Navigation improvements</li>
          </ul>

          <h3>Analytics Cookies</h3>
          <ul>
            <li>Usage statistics</li>
            <li>Performance monitoring</li>
            <li>Error tracking</li>
            <li>Feature usage analysis</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>We may use third-party services that set their own cookies:</p>
          <ul>
            <li>
              <strong>Google Analytics:</strong> For website analytics
            </li>
            <li>
              <strong>MetaMask:</strong> For wallet connectivity
            </li>
            <li>
              <strong>Infura:</strong> For blockchain interactions
            </li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. However,
            disabling certain cookies may affect the functionality of our
            platform.
          </p>

          <h3>Browser Controls</h3>
          <ul>
            <li>Chrome: Settings → Privacy and Security → Cookies</li>
            <li>Firefox: Settings → Privacy & Security → Cookies</li>
            <li>Safari: Preferences → Privacy → Cookies</li>
            <li>Edge: Settings → Cookies and Site Permissions</li>
          </ul>

          <h2>Cookie Retention</h2>
          <p>Different types of cookies are stored for different periods:</p>
          <ul>
            <li>
              <strong>Session cookies:</strong> Deleted when you close your
              browser
            </li>
            <li>
              <strong>Persistent cookies:</strong> Stored for up to 1 year
            </li>
            <li>
              <strong>Authentication cookies:</strong> Stored until you log out
            </li>
          </ul>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact
            us at cookies@skillloop.xyz
          </p>
        </div>
      </div>
    </div>
  );
}
