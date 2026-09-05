import { PageHero } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";
import { SignupForm } from "./SignupForm";

// Not a page we want indexed, and it must always reflect the current state.
export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata("Create a dashboard account", "Register for access to the Najikko Sathi dashboard.", "/signup"),
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <>
    <PageHero
      eyebrow="Dashboard access"
      title="Create an account."
      description="Register to manage content on this website. New accounts need an administrator's approval before they can sign in."
      path="/signup"
      label="Sign up"
    />
    <section className="content-section">
      <div className="site-container signup-grid">
        <SignupForm />
      </div>
    </section>
  </>;
}
