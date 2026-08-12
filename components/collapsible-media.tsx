"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export function CollapsibleMedia({ label, children }: { label: string; children: React.ReactNode }) { const [show,setShow]=useState(false); return <div className="mt-3"><button type="button" onClick={()=>setShow(value=>!value)} className="mb-3 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-bold text-blue-600">{show?<EyeOff className="size-4"/>:<Eye className="size-4"/>}{show?`Hide ${label}`:`Show ${label}`}</button>{show&&children}</div> }
