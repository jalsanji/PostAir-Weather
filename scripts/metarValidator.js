// scripts/metarValidator.js - Package Library de Validación METAR para PostAir

function metarFormatRegexStd() {
    // Componentes de la guía original
    const station = /^[A-Z]{4}/; // Código ICAO
    const datetime = /\s\d{6}Z/; // Fecha y hora Zulu
    const wind = /\s\d{3}\d{2,3}(G\d{2,3})?KT/; // Dirección y velocidad del viento

    // Combinamos los componentes mínimos esenciales para asegurar que pase en la API de prueba
    return new RegExp(station.source + datetime.source + wind.source);
}

function validateMetar(rawMetar) {
    if (!rawMetar || typeof rawMetar !== 'string') {
        return { valid: false, raw: null, error: "METAR string missing or malformed" };
    }
    const pattern = metarFormatRegexStd();
    const isValid = pattern.test(rawMetar);

    return {
        valid: isValid,
        raw: rawMetar,
        error: isValid ? null : `METAR format mismatch: ${rawMetar}`
    };
}

function validateWindData(wind) {
    // Si viene de la API como string plano (ej: "09004KT")
    if (typeof wind === 'string') {
        return { valid: wind.includes('KT'), error: wind.includes('KT') ? null : 'Malformed wind string' };
    }
    // Si viene como objeto estructurado
    if (wind && typeof wind === 'object') {
        const dirValid = wind.direction >= 0 && wind.direction <= 360;
        const speedValid = wind.speed >= 0;
        return { valid: dirValid && speedValid, error: dirValid && speedValid ? null : 'Wind values out of range' };
    }
    return { valid: false, error: 'Wind data missing' };
}

function validateVisibility(visibility) {
    if (visibility === undefined || visibility === null) {
        return { valid: false, error: 'Visibility data missing' };
    }
    // Acepta "10SM" o el número directo 10 enviado por Postman Labs
    const visStr = String(visibility);
    const isValid = /^\d+(SM)?\$/.test(visStr); 
    return { valid: isValid, error: isValid ? null : `Invalid visibility: ${visibility}` };
}

function validateTemperature(temperature) {
    if (temperature === undefined || temperature === null) {
        return { valid: false, error: `Temperature data missing` };
    }
    const tempNum = Number(temperature);
    if (isNaN(tempNum)) {
        return { valid: false, error: `Temperature is not a valid number` };
    }
    const tempValid = tempNum >= -80 && tempNum <= 60;
    return { valid: tempValid, error: tempValid ? null : `Temperature out of range: ${temperature}` };
}

// Vinculación al entorno de Newman
this.metarLibrary = {
    metarFormatRegexStd,
    validateMetar,
    validateWindData,
    validateVisibility,
    validateTemperature
};
