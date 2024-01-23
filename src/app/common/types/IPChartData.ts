export interface IPChartData {
	labels: string[];
	datasets: IPChartDataSet[];
}

export interface IPChartDataSet {
	label: string;
	data: number[];
	backgroundColor: string[];
	borderColor: string[];
	borderWidth: number;
}
