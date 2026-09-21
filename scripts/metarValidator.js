// scripts/metarValidator.js - Package Library de Validación METAR para PostAir

function metarFormatRegexStd() {
    // Build regex for standard METAR format
    const station = /^(METAR\s+)?[A-Z]{4}/; // ICAO airport code
    const datetime = /\s\d{6}Z/; // Date/time group
    const wind = /\s\d{3}\d{2,3}(G\d{2,3})?KT/; // Wind direction + speed
    const vis = /\s\d+SM/; // Visibility in SM
    const sky = /\s(SKC|CLR|FEW|SCT|BKN|OVC)\d{3}/; // Sky condition
    const tempDew = /\sM?\d{2}\/M?\d{2}/; // Temp/dewpoint
    const altim = /\sA\d{4}/; // Altimeter setting

    return new RegExp(
        station.source + datetime.source + wind.source +
        vis.source + sky.source + tempDew.source + altim.source
    );
}

function validateMetar(responseBody) {
    const pattern = metarFormatRegexStd();
    const rawMetar = responseBody[0].metar.raw;
    const isValid = pattern.test(rawMetar);

    return {
        valid: isValid,
        raw: rawMetar,
        error: isValid ? null : `METAR format mismatch: ${rawMetar}`
    };
}

function validateWindData(wind) {
    if (!wind || typeof wind.direction !== 'number') {
        return { valid: false, error: 'Wind data missing or malformed' };
    }
    const dirValid = wind.direction >= 0 && wind.direction <= 360;
    const speedValid = wind.speed >= 0;

    return {
        valid: dirValid && speedValid,
        error: dirValid && speedValid ? null : `Wind out of range: dir=${wind.direction}, spd=${wind.speed}`
    };
}

function validateVisibility(visibility) {
    const pattern = /^\d+SM\$/;
    if (!visibility || !pattern.test(visibility)) {
        return { valid: false, error: `Invalid visibility: ${visibility}` };
    }
    return { valid: true, error: null };
}

function validateTemperature(temperature) {
    if (temperature === undefined || typeof temperature !== 'number') {
        return { valid: false, error: `Temperature data missing or malformed` };
    }
    const tempValid = temperature >= -80 && temperature <= 60;

    return {
        valid: tempValid,
        error: tempValid ? null : `Temperature out of range (-80 to 60 °C): ${temperature}°C`
    };
}

// Expone TODAS las funciones de manera global dentro de un objeto llamado metarLibrary
// Esto reemplaza la necesidad de usar module.exports en el entorno gratuito de Newman
globalThis.metarLibrary = {
    metarFormatRegexStd,
    validateMetar,
    validateWindData,
    validateVisibility,
    validateTemperature
};
