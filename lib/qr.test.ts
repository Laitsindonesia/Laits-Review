import test from "node:test";
import assert from "node:assert/strict";
import {
  determineCardDestination,
  buildGoogleReviewUrl,
  isValidActivationMode,
  ACTIVATION_MODE_DIRECT,
  ACTIVATION_MODE_LAITS,
} from "./qr.ts";

const CARD = "57142";
const PLACE_ID = "ChIJVQOMqL_0cC4RRnJ91Fd2JEw";
const GOOGLE_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

test("isValidActivationMode: hanya menerima dua nilai resmi", () => {
  assert.equal(isValidActivationMode("DIRECT_GOOGLE_REVIEW"), true);
  assert.equal(isValidActivationMode("LAITS_SOFTWARE"), true);
  assert.equal(isValidActivationMode(""), false);
  assert.equal(isValidActivationMode(null), false);
  assert.equal(isValidActivationMode("GOOGLE"), false);
  assert.equal(isValidActivationMode(undefined), false);
});

test("buildGoogleReviewUrl: valid, kosong, dan spasi", () => {
  assert.equal(buildGoogleReviewUrl(PLACE_ID), GOOGLE_URL);
  assert.equal(buildGoogleReviewUrl(` ${PLACE_ID} `), GOOGLE_URL);
  assert.equal(buildGoogleReviewUrl(""), null);
  assert.equal(buildGoogleReviewUrl(null), null);
});

test("endpoint admin eksternal selalu menang atas mode aktivasi", () => {
  for (const mode of [ACTIVATION_MODE_DIRECT, ACTIVATION_MODE_LAITS, null]) {
    const dest = determineCardDestination({
      qrDestination: "https://wa.me/6281234567890",
      cardId: CARD,
      activationMode: mode,
      placeId: PLACE_ID,
    });
    assert.deepEqual(dest, {
      kind: "external",
      url: "https://wa.me/6281234567890",
    });
  }
});

test("endpoint admin internal valid juga menang", () => {
  const dest = determineCardDestination({
    qrDestination: "/promo",
    cardId: CARD,
    activationMode: ACTIVATION_MODE_DIRECT,
    placeId: PLACE_ID,
  });
  assert.deepEqual(dest, { kind: "internal", path: "/promo" });
});

test("endpoint kosong + Direct + PlaceId valid -> Google Review", () => {
  const dest = determineCardDestination({
    qrDestination: "",
    cardId: CARD,
    activationMode: ACTIVATION_MODE_DIRECT,
    placeId: PLACE_ID,
  });
  assert.deepEqual(dest, { kind: "external", url: GOOGLE_URL });
});

test("endpoint kosong + Laits -> halaman /r (feedback Laits)", () => {
  const dest = determineCardDestination({
    qrDestination: "",
    cardId: CARD,
    activationMode: ACTIVATION_MODE_LAITS,
    placeId: PLACE_ID,
  });
  assert.deepEqual(dest, { kind: "default", path: `/r/${CARD}` });
});

test("kartu lama tanpa mode (NULL) -> perilaku default /r", () => {
  for (const mode of [null, undefined, ""]) {
    const dest = determineCardDestination({
      qrDestination: "",
      cardId: CARD,
      activationMode: mode,
      placeId: "",
    });
    assert.deepEqual(dest, { kind: "default", path: `/r/${CARD}` });
  }
});

test("Direct tanpa PlaceId -> fallback aman ke /r", () => {
  const dest = determineCardDestination({
    qrDestination: "",
    cardId: CARD,
    activationMode: ACTIVATION_MODE_DIRECT,
    placeId: "",
  });
  assert.deepEqual(dest, { kind: "default", path: `/r/${CARD}` });
});

test("endpoint rusak -> jatuh ke /r, jangan open redirect", () => {
  const rusak = [
    "javascript:alert(1)",
    "http://example.com",
    "https://localhost",
    "https://192.168.1.1/x",
    "//evil.example",
  ];
  for (const qrDestination of rusak) {
    const dest = determineCardDestination({
      qrDestination,
      cardId: CARD,
      activationMode: null,
      placeId: "",
    });
    assert.deepEqual(
      dest,
      { kind: "default", path: `/r/${CARD}` },
      `destinasi rusak harus fallback: ${qrDestination}`
    );
  }
});

test("matriks perilaku yang diwajibkan bisnis", () => {
  const kasus = [
    {
      nama: "Direct + endpoint kosong -> Google Review",
      input: { qrDestination: "", activationMode: ACTIVATION_MODE_DIRECT, placeId: PLACE_ID },
      expected: { kind: "external", url: GOOGLE_URL },
    },
    {
      nama: "Laits + endpoint kosong -> /r",
      input: { qrDestination: "", activationMode: ACTIVATION_MODE_LAITS, placeId: PLACE_ID },
      expected: { kind: "default", path: `/r/${CARD}` },
    },
    {
      nama: "Direct + endpoint WhatsApp -> WhatsApp",
      input: { qrDestination: "https://wa.me/62811", activationMode: ACTIVATION_MODE_DIRECT, placeId: PLACE_ID },
      expected: { kind: "external", url: "https://wa.me/62811" },
    },
    {
      nama: "Laits + endpoint Google Form -> Google Form",
      input: { qrDestination: "https://docs.google.com/forms/d/abc", activationMode: ACTIVATION_MODE_LAITS, placeId: PLACE_ID },
      expected: { kind: "external", url: "https://docs.google.com/forms/d/abc" },
    },
    {
      nama: "Direct + endpoint Instagram -> Instagram",
      input: { qrDestination: "https://instagram.com/laits", activationMode: ACTIVATION_MODE_DIRECT, placeId: PLACE_ID },
      expected: { kind: "external", url: "https://instagram.com/laits" },
    },
    {
      nama: "Laits + endpoint lain -> endpoint lain",
      input: { qrDestination: "https://example.com/promo", activationMode: ACTIVATION_MODE_LAITS, placeId: PLACE_ID },
      expected: { kind: "external", url: "https://example.com/promo" },
    },
  ];
  for (const k of kasus) {
    const dest = determineCardDestination({
      ...k.input,
      cardId: CARD,
    });
    assert.deepEqual(dest, k.expected, k.nama);
  }
});
