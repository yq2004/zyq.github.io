---
title: Randomised Algorithm
date: {{date}}
hidden: true
tag:
- 算法基础
- 随机算法
- 概率算法
categories:
- [算法, 算法基础]

---

# Randomised Algorithm

> 算法执行过程中面临选择时，随机选择比最优选择更省时，因此随机算法可以很大程度上降低算法的复杂度。主要分为四种随机算法：
>
> - 数据概率算法：用于数值问题的求解，随着算法执行时间延长，其得到的近似解的结果与真实结果越相近。
> - Las Vegas算法：一旦找到解，解一定正确，但有限度，一旦超过限度，则说明无法找到解，算法失败。
> - Monte Carlo算法：一定能找到解，但解不一定正确，执行时间越久，解正确的概率越大。
> - Sherwood算法：一定能找到正确的解，用于某确定性算法最坏时间复杂度与平均时间复杂度相差较大的情况，通过降低特定用例与最坏行为之间的关联度来完成优化，比如快速排序中，基准元素选择随机元素。

## MonteCarlo

> 用蒙特卡洛算法求π 设有一个边长为2的正方形，正方形内有一个内切圆，则他们的面积比为4:π. 设有一个随机点，x y随机取到[0,1\](只考虑第一象限)
>
> 则x y落在圆内的次数 : x y生成的总次数(足够多),就近似于4:π，设x y总生成次数为n 落在圆内次数为m 则m/n=4/π 因此：π=4m/n.

```c++
#include<iostream>
using namespace std;

int randa(int a,int b) {
	return rand() % (b - a + 1) + a;
}

double randa01() {
	return randa(0, 100) * 1.0 / 100;		//1.0
}

double approximatePI() {
	double x = 0, y = 0;		//double xy!!
	int m = 0;
	int n = 0x3f3f3f3f;
	for (int i = 0; i < n; i++)
	{
		x = randa01(); y = randa01();
		if (x * x + y * y <= 1.0)
			m++;
	}
	return  4.0* m / n;		//4.0
}

int main() {
	srand((unsigned)time(NULL));		//很重要！随机种子
	cout<< approximatePI();
}
```

## Las Vegas

> 用拉斯维加斯算法求N皇后问题的一个解，对于每个皇后的纵坐标，都用随机数来试探，直到试探出一组随机数使得条件成立，一旦成立就说明找到了解，否则说明没有找到，很符合Las Vegas算法，而且尝试的次数越多，越容易找到解。

```c++
#include<iostream>
using namespace std;

const int MAX = 20;
int q[MAX];
int times = 0;

int randa(int a, int b) {
	return rand() % (b - a + 1) + a;
}

void printResult(int n) {
	cout << "第" << times << "次运行找到结果:\n";
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= n; j++)
			if (j != q[i]) cout << "o ";
			else cout << "* ";
		cout << "\n";
	}
}

bool canPlace(int i,int j) {
	if (i == 1) return true;
	int k = 1;
	while (k < i) {
		if ((q[k])==j || abs(q[k]-j) == abs(i-k))
			return false;
		k++;
	}
	return true;
}

bool NQueen(int layer,int n) {
	if (layer > n) {
		printResult(n);
		return true;
	}
	else {
		int tryTimes = 0;
		int position = 0;
		while (tryTimes <= n) {
			position = randa(1, n);
			tryTimes++;
			if (canPlace(layer, position)) break;
		}
		//退出循环有两种情况：找到了一个解break，此情况需要更进一层。
		//或者是所有位置都尝试了但还是没找到符合要求的，说明之前有一处找错了，说明这次随机没有解决问题
		if (tryTimes > n) return false;
		q[layer] = position;
		NQueen(layer + 1, n);
	}
}

int main() {
	srand((unsigned)time(NULL));
	int n = 6;
	while (times < 100) {
		if (NQueen(1,n))
			break;		//找到一个解就不找了
		cout << "第" << times++ << "次没找到解\n";
	}
}
```

## Sherwood

> 用舍伍德算法优化快速排序，由于当快速排序选定的基准元素若为最大or最小值时，此时的时间复杂度最差，因此要避免这种极端情况，可以采用生成随机基准，降低特定实例(基准)与最坏行为(极端情况)的关联来改善快排的实际效率。

```c++
#include<iostream>
using namespace std;

int randa(int a, int b) {
	return rand() % (b - a + 1)+a;
}

int partition(int a[],int l,int r) {
	int tmp = a[l];
	int i = l; int j = r;
	while (i!=j) {
		while (i<j and a[j]>=tmp) j--;
		a[i] = a[j];
		while (i < j and a[i] <= tmp) i++;
		a[j] = a[i];
	}
	a[i] = tmp;
	return i;
}

void QuickSort(int a[], int l, int r) {
	if (l < r) {
		int i = randa(l, r);
		swap(a[l], a[i]);
		int p = partition(a, l, r);
		QuickSort(a, l, p -1);
		QuickSort(a, p+1 , r);
	}
}

int main() {
	srand((unsigned)time(NULL));
	int a[10] = { 1,2,4,2,52,6,3,7,3,222};
	/*int a[10] = { 2,5,1,7,10,6,9,4,3,8 };*/
	QuickSort(a, 0, 9);
	for (int i = 0; i < 10; i++)
		cout << a[i] << " ";
} 
```

