import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isAllowedImageSrc,
  isExternalHref,
  sanitizeLinkHref,
} from "./urlPolicy";

describe("markdown urlPolicy", () => {
  const baseOrigin = "https://example.com";

  describe("sanitizeLinkHref", () => {
    it("allows http/https links", () => {
      expect(sanitizeLinkHref("https://example.com/a", { baseOrigin })).toBe(
        "https://example.com/a"
      );
      expect(sanitizeLinkHref("http://example.com/a", { baseOrigin })).toBe(
        "http://example.com/a"
      );
    });

    it("allows relative links", () => {
      expect(sanitizeLinkHref("/blog/1", { baseOrigin })).toBe("/blog/1");
      expect(sanitizeLinkHref("#section", { baseOrigin })).toBe("#section");
    });

    it("blocks dangerous protocols", () => {
      expect(sanitizeLinkHref("javascript:alert(1)", { baseOrigin })).toBeNull();
      expect(sanitizeLinkHref("data:text/html,<h1>x</h1>", { baseOrigin })).toBeNull();
      expect(sanitizeLinkHref("vbscript:msgbox(1)", { baseOrigin })).toBeNull();
      expect(sanitizeLinkHref("file:///etc/passwd", { baseOrigin })).toBeNull();
    });
  });

  describe("isAllowedImageSrc", () => {
    it("allows same-host images", () => {
      expect(isAllowedImageSrc("https://example.com/images/a.png", { baseOrigin })).toBe(
        true
      );
      expect(isAllowedImageSrc("/images/a.png", { baseOrigin })).toBe(true);
    });

    it("allows localhost in dev", () => {
      expect(isAllowedImageSrc("http://localhost:5173/a.png", { baseOrigin })).toBe(true);
      expect(isAllowedImageSrc("http://127.0.0.1:5173/a.png", { baseOrigin })).toBe(true);
    });

    it("blocks other hosts and non-network protocols", () => {
      expect(isAllowedImageSrc("https://evil.com/a.png", { baseOrigin })).toBe(false);
      expect(isAllowedImageSrc("data:image/png;base64,aaaa", { baseOrigin })).toBe(false);
      expect(isAllowedImageSrc("blob:https://example.com/123", { baseOrigin })).toBe(false);
    });
    describe("CDN domain support", () => {
      beforeEach(() => {
        vi.resetModules();
      });
      afterEach(() => {
        vi.unstubAllEnvs();
      });
      it("allows CDN images when VITE_CDN_DOMAIN is set", async () => {
        vi.stubEnv("VITE_CDN_DOMAIN", "cdn.myblog.com");
        const { isAllowedImageSrc: freshCheck } = await import("./urlPolicy");
        expect(freshCheck("https://cdn.myblog.com/uuid.png", { baseOrigin })).toBe(true);
        expect(freshCheck("https://cdn.myblog.com/images/post-header.jpg", { baseOrigin })).toBe(true);
      });
      it("blocks CDN images when VITE_CDN_DOMAIN not set", async () => {
        const { isAllowedImageSrc: freshCheck } = await import("./urlPolicy");
        expect(freshCheck("https://cdn.myblog.com/uuid.png", { baseOrigin })).toBe(false);
      });
    });
  });

  describe("isExternalHref", () => {
    it("treats same-origin and relative as internal", () => {
      expect(isExternalHref("https://example.com/a", { baseOrigin })).toBe(false);
      expect(isExternalHref("/a", { baseOrigin })).toBe(false);
      expect(isExternalHref("#hash", { baseOrigin })).toBe(false);
    });

    it("treats other origins as external", () => {
      expect(isExternalHref("https://google.com", { baseOrigin })).toBe(true);
    });
  });
});


