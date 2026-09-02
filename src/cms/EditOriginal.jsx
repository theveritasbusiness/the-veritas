import React from "react";
import { useParams } from "../lib/router";
import OriginalEditor from "./OriginalEditor";

export default function EditOriginal() {
  const { id } = useParams();

  return <OriginalEditor mode="edit" originalId={id} />;
}
