const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

async function ApiFetch(method, route, body) {
  try {
    const response = await fetch(`${baseURL}${route}`, {
      method: method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      credentials: "include",
    });

    // ✅ Tenta converter em JSON, mesmo se status for 400
    const data = await response.json();

    // ✅ Anexa info sobre o status HTTP
    return {
      ...data,
      httpStatus: response.status,
      ok: response.ok,
    };
  } catch (error) {
    console.error("Erro na API:", error);
    return {
      success: false,
      msg: "Não foi possível se conectar ao servidor",
      error,
    };
  }
}

export default ApiFetch;