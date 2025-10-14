export function getRandomNumber(max: number) {
	return Math.floor(Math.random() * max) + 1;
}

export function parseRouteId(param: string | undefined): number | undefined {
	if (param === undefined) {
		return undefined;
	}
	const num = parseInt(param, 10);
	return isNaN(num) ? undefined : num;
}
