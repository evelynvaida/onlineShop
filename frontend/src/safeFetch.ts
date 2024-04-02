type Response = {
    success: true;
    status: number,
    data: null,
} | {
    success: false;
    status: number | null,
};

export const safeFetch = async (method: string, url: string, data?: any): Promise<Response> => {
    try {
        const response = await fetch(url, {
            method: method,
            headers: data ? { "Content-Type": "application/json" } : {},
            body: data ? JSON.stringify(data) : undefined,
        });
        if (response.status > 299) {
            return { success: false, status: response.status }

        }
        const responseData = await response.json()
        return { success: true, status: 200, data: responseData }
    } catch (error) {
        return { success: false, status: null }
    }

};