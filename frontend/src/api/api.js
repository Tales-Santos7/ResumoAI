const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

async function ApiFetch(method, route, body) {
  try {
    const response = await fetch(`${baseURL}${route}`, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      credentials: "include",
    });

    const data = await response.json();
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
