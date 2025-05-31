import Link from "next/link";
import React from "react";

function About() {
  return (
    <section className="w-full p-5 md:p-10 text-[#1a1a1a] flex flex-col items-center relative">
      <Link
        href="/"
        className="absolute md:top-10 md:right-10 top-5 right-5 underline underline-offset-4"
      >
        back to page
      </Link>
      <h1 className="text-4xl w-fit mx-auto mt-[10vh] md:mt-2">About us</h1>
      <p className="w-full md:w-[60%] mt-8 tracking-wide">
        We are an AI-powered platform that helps you find the best skincare
        products for your unique needs. Our smart technology looks at your face
        images to understand your skin type and concerns, then recommends
        products that are just right for you. Everything is done in real time
        using advanced algorithms, and we make sure your privacy is
        protected—none of your data is stored. We’re here to make skincare
        simple, personal, and effective.
      </p>
      <div className="w-full md:w-[60%] flex flex-col gap-4 mt-8">
        <div className="w-full">
          <h1 className="text-lg">AI-Powered</h1>
          <p>Advanced alogorthims for real-time analysis</p>
        </div>
        <div className="w-full">
          <h1 className="text-lg">Personalized</h1>
          <p>Tailored recommendations to fit your needs</p>
        </div>
        <div className="w-full">
          <h1 className="text-lg">Secure</h1>
          <p>Privacy focused, no data is stored</p>
        </div>
      </div>
      <p className="w-[60%] text-xl mt-8 opacity-60">Welcome to skinval.</p>
    </section>
  );
}

export default About;
