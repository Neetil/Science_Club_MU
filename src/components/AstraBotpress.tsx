"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const INJECT_URL = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
const WEBCHAT_BUNDLE_URL = "https://files.bpcontent.cloud/2026/04/03/08/20260403083441-6SZ58KQQ.js";
const BOT_NAME = "Astra AI";

export function AstraBotpress() {
  const configAppliedRef = useRef(false);

  // Apply bot name when webchat is initialized
  useEffect(() => {
    let timer: number | undefined;

    const attach = () => {
      const bp = (window as any).botpress;
      if (!bp?.on || !bp?.config) return false;

      bp.on("webchat:initialized", () => {
        try {
          bp.config({ configuration: { botName: BOT_NAME } });
          configAppliedRef.current = true;
        } catch {
          // ignore
        }
      });

      return true;
    };

    timer = window.setInterval(() => {
      if (attach()) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Script src={INJECT_URL} strategy="afterInteractive" />
      <Script src={WEBCHAT_BUNDLE_URL} strategy="afterInteractive" />
    </>
  );
}

