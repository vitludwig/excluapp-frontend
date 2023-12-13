export function capitalizeEachFirstLetter(value: string) {
	const words = value.split(' ');
	for (let i = 0; i < words.length; i++) {
		words[i] = words[i][0].toUpperCase() + words[i].substring(1);
	}
	return words.join(' ');
}
