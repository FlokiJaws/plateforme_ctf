import React from 'react';
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";

const FormField = ({ label, type = "text", placeholder, value, onChange, error }) => {
    const errorList = error ? (Array.isArray(error) ? error : [error]) : [];

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className={errorList.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
            />
            {errorList.map((msg, index) => (
                <p key={index} className="text-xs text-red-500">
                    • {msg}
                </p>
            ))}
        </div>
    );
};

export default FormField;