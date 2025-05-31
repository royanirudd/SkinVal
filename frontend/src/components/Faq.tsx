import Dropdown from "@/animated-comps/Dropdown";
import React from "react";

function Faq() {
  return (
    <section className="w-full p-5 py-10 md:p-10 text-[#1a1a1a]">
      <h1 className="w-fit text-3xl md:text-4xl text-[#1a1a1a] mx-auto mb-10">
        FAQs
      </h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full  md:w-[30%] md:mt-[10vh]">
          <h1 className="flex justify-center">some questions</h1>
        </div>
        <div className="w-full md:w-[70%]">
          <Dropdown
            question="How does it work?"
            answer="BestMatch.AI uses advanced AI to analyze your facial features and provide tailored product recommendations."
          />
          <Dropdown
            question="Is my data secure?"
            answer="Yes, all data processing is done on-device, and we do not store any personal data."
          />
        </div>
      </div>
    </section>
  );
}

export default Faq;
