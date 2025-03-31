/**
 * Create a way to resolve a Promise manually.
 * @returns - {
 *     wait - Returns the Promise to await
 *     done - Resolves the Promise returned by wait
 * }
 */
export function createResolver<T>() {
    let resolver: (r: T | undefined) => void;
    const promise = new Promise<T | undefined>((resolve) => {
        resolver = (response: T | undefined) => {
            resolve(response);
        };
    });

    function wait() {
        return promise;
    }

    function done(data: T | undefined) {
        resolver(data);
    }

    return { wait, done };
}
