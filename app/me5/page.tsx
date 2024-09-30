"use client";

import DynamicInput from "./dynamic-input";

export default function Me5Page() {
  return (
    <div className="flex flex-col items-center h-screen">
      <h1 className="text-7xl font-bold my-8">Mind Dump</h1>
      <h2 className="text-2xl font-semibold mb-8">
        List anything and everything that is currently bothering you or feels
        bad
      </h2>
      <DynamicInput />
    </div>
  );
}
