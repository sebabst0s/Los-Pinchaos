#!/usr/bin/env node
// Sube las fotos de perfil de los participantes a Supabase Storage (bucket
// "avatars") y actualiza participants.avatar_url para cada uno.
//
// Uso:
//   node scripts/upload-avatars.mjs ./carpeta-con-fotos
//
// Cómo preparar la carpeta:
//   - Una foto por persona, nombrada igual que el participante en la app
//     (no importan mayúsculas ni tildes): Jorge.jpg, Nikole.png, Isidora.jpg,
//     Javier.jpg, Cristobal.jpg, Fiorella.jpg, Kiara.jpg, Alonso.jpg,
//     Camila.jpg, Sebastian.jpg
//   - Formatos soportados: .jpg .jpeg .png .webp .gif
//
// Requiere que exista .env.local con NEXT_PUBLIC_SUPABASE_URL y
// NEXT_PUBLIC_SUPABASE_ANON_KEY (los mismos que usa la app).

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function loadEnvLocal() {
  const envPath = join(projectRoot, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error("Uso: node scripts/upload-avatars.mjs ./carpeta-con-fotos");
    process.exit(1);
  }
  if (!existsSync(folder)) {
    console.error(`No existe la carpeta: ${folder}`);
    process.exit(1);
  }

  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (revisa .env.local)."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: participants, error } = await supabase
    .from("participants")
    .select("id, name, avatar_url");

  if (error) {
    console.error("No se pudo leer la tabla participants:", error.message);
    process.exit(1);
  }

  const files = readdirSync(folder).filter((f) =>
    Object.keys(CONTENT_TYPES).includes(extname(f).toLowerCase())
  );

  const matchedParticipantIds = new Set();

  for (const file of files) {
    const rawExt = extname(file);
    const ext = rawExt.toLowerCase();
    const fileKey = normalize(basename(file, rawExt));
    const participant = participants.find((p) => normalize(p.name) === fileKey);

    if (!participant) {
      console.warn(`⚠️  Sin match para "${file}" — renómbralo igual que el participante.`);
      continue;
    }

    const storagePath = `${participant.id}${ext}`;
    const buffer = readFileSync(join(folder, file));

    if (buffer.length > 3 * 1024 * 1024) {
      console.warn(
        `⚠️  "${file}" pesa ${(buffer.length / 1024 / 1024).toFixed(1)}MB — si falla la subida, ` +
          `achícala primero (ej: sips -Z 800 "${file}") y volvé a correr el script.`
      );
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(storagePath, buffer, {
        contentType: CONTENT_TYPES[ext],
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Error subiendo "${file}":`, uploadError.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(storagePath);

    const { error: updateError } = await supabase
      .from("participants")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", participant.id);

    if (updateError) {
      console.error(`❌ Se subió "${file}" pero no se pudo actualizar la fila:`, updateError.message);
      continue;
    }

    matchedParticipantIds.add(participant.id);
    console.log(`✅ ${participant.name} <- ${file}`);
  }

  const missing = participants.filter(
    (p) => !matchedParticipantIds.has(p.id) && !p.avatar_url
  );
  if (missing.length > 0) {
    console.log(
      `\nSin foto todavía: ${missing.map((p) => p.name).join(", ")}`
    );
  }
}

main();
