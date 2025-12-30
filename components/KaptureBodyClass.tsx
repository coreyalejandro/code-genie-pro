"use client";

import { useEffect } from "react";

export function KaptureBodyClass() {
  useEffect(() => {
    document.body.classList.add("kapture-loaded");
    return () => document.body.classList.remove("kapture-loaded");
  }, []);

  return null;
}

