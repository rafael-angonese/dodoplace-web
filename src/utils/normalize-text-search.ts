export const normalizeTextSearch = (str: string) => {
	return str
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
}
