import React from "react";

export default function FormattedTime({ isoString }) {
  if (!isoString) return null;

  const date = new Date(isoString);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JS month 0-11
  const year = date.getFullYear();

  const formatted = `${hours}:${minutes} ${day}-${month}-${year}`;

  return <>{formatted}</>;
}
