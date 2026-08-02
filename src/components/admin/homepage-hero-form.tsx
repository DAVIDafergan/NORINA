"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleTabsInput } from "@/components/admin/locale-tabs-input";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/admin/file-to-data-url";
import type { LocalizedText } from "@/lib/types";

type HeroMediaType = "IMAGE" | "VIDEO";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4"];

const ERROR_MESSAGES: Record<string, string> = {
  invalid_media: "הקובץ פגום או לא נקרא כראוי - נסי קובץ אחר.",
  invalid_image_type: "תמונת הרקע חייבת להיות JPG או WebP.",
  invalid_video_type: "הסרטון חייב להיות בפורמט MP4.",
  image_too_large: "התמונה גדולה מדי - הגודל המרבי הוא 5MB.",
  video_too_large: "הסרטון גדול מדי - הגודל המרבי הוא 20MB.",
  desktop_media_required: "יש להעלות תמונת/סרטון רקע לפני השמירה.",
  invalid_input: "אחד השדות אינו תקין - בדקי ונסי שוב.",
};

interface StagedFile {
  file: File;
  previewUrl: string;
}

function validateFile(file: File, kind: HeroMediaType): string | null {
  if (kind === "IMAGE") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return ERROR_MESSAGES.invalid_image_type;
    if (file.size > MAX_IMAGE_BYTES) return ERROR_MESSAGES.image_too_large;
  } else {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) return ERROR_MESSAGES.invalid_video_type;
    if (file.size > MAX_VIDEO_BYTES) return ERROR_MESSAGES.video_too_large;
  }
  return null;
}

export function HomepageHeroForm({
  initial,
}: {
  initial: {
    heroMediaType: HeroMediaType;
    heroDesktopMediaId: string | null;
    heroMobileMediaId: string | null;
    heroEyebrow: LocalizedText;
    heroHeadline: LocalizedText;
    heroSubheadline: LocalizedText;
  };
}) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<HeroMediaType>(initial.heroMediaType);
  const [desktopStaged, setDesktopStaged] = useState<StagedFile | null>(null);
  const [mobileStaged, setMobileStaged] = useState<StagedFile | null>(null);
  const [mobileCleared, setMobileCleared] = useState(false);
  const [eyebrow, setEyebrow] = useState<LocalizedText>(initial.heroEyebrow);
  const [headline, setHeadline] = useState<LocalizedText>(initial.heroHeadline);
  const [subheadline, setSubheadline] = useState<LocalizedText>(initial.heroSubheadline);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Revoke staged object URLs on unmount / replacement so we don't leak memory.
  useEffect(() => {
    return () => {
      if (desktopStaged) URL.revokeObjectURL(desktopStaged.previewUrl);
      if (mobileStaged) URL.revokeObjectURL(mobileStaged.previewUrl);
    };
  }, [desktopStaged, mobileStaged]);

  const existingDesktopStillValid = mediaType === initial.heroMediaType && !!initial.heroDesktopMediaId;
  const desktopPreviewUrl = desktopStaged
    ? desktopStaged.previewUrl
    : existingDesktopStillValid
      ? `/api/media/${initial.heroDesktopMediaId}`
      : null;

  const existingMobileStillValid = mediaType === "IMAGE" && mediaType === initial.heroMediaType && !!initial.heroMobileMediaId;
  const mobilePreviewUrl = mobileStaged
    ? mobileStaged.previewUrl
    : !mobileCleared && existingMobileStillValid
      ? `/api/media/${initial.heroMobileMediaId}`
      : null;

  const canSave = useMemo(() => desktopPreviewUrl !== null, [desktopPreviewUrl]);

  function handleMediaTypeChange(next: HeroMediaType) {
    setMediaType(next);
    setFieldError(null);
    if (next === "VIDEO") {
      setMobileStaged(null);
      setMobileCleared(false);
    }
  }

  async function handleDesktopFile(file: File | null) {
    if (!file) return;
    const error = validateFile(file, mediaType);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);
    if (desktopStaged) URL.revokeObjectURL(desktopStaged.previewUrl);
    setDesktopStaged({ file, previewUrl: URL.createObjectURL(file) });
  }

  async function handleMobileFile(file: File | null) {
    if (!file) return;
    const error = validateFile(file, "IMAGE");
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);
    if (mobileStaged) URL.revokeObjectURL(mobileStaged.previewUrl);
    setMobileStaged({ file, previewUrl: URL.createObjectURL(file) });
    setMobileCleared(false);
  }

  function handleRemoveMobile() {
    if (mobileStaged) URL.revokeObjectURL(mobileStaged.previewUrl);
    setMobileStaged(null);
    setMobileCleared(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    const body: Record<string, unknown> = {
      heroMediaType: mediaType,
      heroEyebrow: eyebrow,
      heroHeadline: headline,
      heroSubheadline: subheadline,
    };
    if (desktopStaged) body.heroDesktopMedia = { dataUrl: await fileToDataUrl(desktopStaged.file), mimeType: desktopStaged.file.type };
    if (mobileStaged) body.heroMobileMedia = { dataUrl: await fileToDataUrl(mobileStaged.file), mimeType: mobileStaged.file.type };
    else if (mobileCleared) body.heroMobileMedia = null;

    const res = await fetch("/api/admin/homepage-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setSaveError(ERROR_MESSAGES[payload.error] ?? "השמירה נכשלה - נסי שוב.");
      return;
    }
    setSaved(true);
    setDesktopStaged(null);
    setMobileStaged(null);
    setMobileCleared(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-soft">סוג מדיה</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMediaTypeChange("IMAGE")}
            className={`min-h-11 rounded-sm border px-5 text-sm transition-colors ${
              mediaType === "IMAGE" ? "border-ink bg-ink text-cream" : "border-ink/20 text-ink/70 hover:border-ink/50"
            }`}
          >
            תמונה
          </button>
          <button
            type="button"
            onClick={() => handleMediaTypeChange("VIDEO")}
            className={`min-h-11 rounded-sm border px-5 text-sm transition-colors ${
              mediaType === "VIDEO" ? "border-ink bg-ink text-cream" : "border-ink/20 text-ink/70 hover:border-ink/50"
            }`}
          >
            סרטון
          </button>
        </div>
      </div>

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-soft">
          רקע Hero (דסקטופ) {mediaType === "VIDEO" ? "- MP4" : "- JPG/WebP"}
        </h2>
        <p className="mb-4 text-xs text-ink-soft">
          {mediaType === "VIDEO" ? "עד 20MB, יתנגן אוטומטית בלולאה, מושתק." : "עד 5MB."}
        </p>

        <div className="mb-4 aspect-[21/9] w-full overflow-hidden rounded-sm bg-cream-deep">
          {desktopPreviewUrl ? (
            mediaType === "VIDEO" ? (
              <video src={desktopPreviewUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local blob/streamed preview, not eligible for next/image optimization
              <img src={desktopPreviewUrl} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
              {mediaType === "VIDEO" ? "יש להעלות קובץ MP4" : "יש להעלות תמונה"}
            </div>
          )}
        </div>

        <input
          type="file"
          accept={mediaType === "VIDEO" ? "video/mp4" : "image/jpeg,image/webp"}
          onChange={(e) => handleDesktopFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>

      {mediaType === "IMAGE" && (
        <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-soft">גרסת מובייל (אופציונלי)</h2>
          <p className="mb-4 text-xs text-ink-soft">
            יחס גובה-רוחב אנכי יותר, עד 5MB. אם לא תעלי - תוצג אותה תמונת הדסקטופ עם קרופ אוטומטי מרכזי.
          </p>

          <div className="mb-4 aspect-[4/5] w-40 overflow-hidden rounded-sm bg-cream-deep">
            {mobilePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob/streamed preview, not eligible for next/image optimization
              <img src={mobilePreviewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-xs text-ink-soft">
                קרופ אוטומטי מהדסקטופ
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/webp"
              onChange={(e) => handleMobileFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            {mobilePreviewUrl && (
              <button type="button" onClick={handleRemoveMobile} className="text-sm text-red-600 hover:underline">
                הסרה
              </button>
            )}
          </div>
        </div>
      )}

      {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-soft">כותרת וטקסט</h2>
        <div className="flex flex-col gap-5">
          <LocaleTabsInput label="שורת פתיחה קטנה (Eyebrow)" value={eyebrow} onChange={setEyebrow} />
          <LocaleTabsInput label="כותרת ראשית" value={headline} onChange={setHeadline} />
          <LocaleTabsInput label="תת-כותרת" value={subheadline} onChange={setSubheadline} multiline />
        </div>
      </div>

      <div className="rounded-md border border-line bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-soft">תצוגה מקדימה</h2>
        <div className="relative flex aspect-[21/9] w-full items-center justify-center overflow-hidden rounded-sm bg-cream-deep">
          {desktopPreviewUrl &&
            (mediaType === "VIDEO" ? (
              <video
                src={desktopPreviewUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local blob/streamed preview, not eligible for next/image optimization
              <img src={desktopPreviewUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ))}
          <div className="absolute inset-0 bg-ink/10" />
          <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold">{eyebrow.he}</p>
            <h3 className="font-serif text-2xl uppercase tracking-[0.06em] text-ink md:text-4xl">{headline.he}</h3>
            <p className="max-w-md text-xs text-ink/70 md:text-sm">{subheadline.he}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving || !canSave}>
          {saving ? "שומרת..." : "שמירה"}
        </Button>
        {saved && <p className="text-sm text-green-700">נשמר בהצלחה.</p>}
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      </div>
    </form>
  );
}
