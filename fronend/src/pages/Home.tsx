import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import HowItWorks from "../components/Home/HowItWork";
import Pricing from "../components/Home/Pricing";
import Footer from "../components/Home/Footer";

export default function Home() {
    return (
        <div className="min-h-screen">
            <Hero />
            <Features />
            <HowItWorks />
            <Pricing />
            <Footer />
        </div>
    );
}