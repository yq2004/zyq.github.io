---
title: Backtrack
date: {{date}}
hidden: true
tags:
- 算法基础
- 回溯
- backtrack
categories:
- [算法, 算法基础]
---

# Backtrack

> 后悔药，时光机…没有什么最优解，只是遍历了所有时空才确定了你。

<!-- more -->

## 概述
### 递归和非递归
回溯法可由递归和非递归方式实现，根据问题性质是排列还是集合，也可以抽象出对应的模板。
非递归回溯需要设计额外的数据结构来保存节点。

### 排列与子集

问题的解空间树有两种类型。若问题为从含n个元素的集合S中找出符合某约束的元素的集合，此为**子集树**，比如求子集问题；若问题为从含n个元素的集合S从，找出满足约束的n个元素的排列，此为**排列树**，比如求全排列问题。

#### 幂集问题

分析：设定一个数组bool choose[n]表示这n个对应的元素是否被选了，因此对于n个元素，从第一个元素开始，若选中了，则置choose[i]=1;直到处理完最后一个元素，输出这组结果，然后回溯上一层…

建模：

![](https://s3.bmp.ovh/imgs/2023/11/21/b6461ba45eeeb71f.png)

代码：

```c++
#include<iostream>
#include<algorithm>
using namespace std;

//now：当前处理的元素 last：数组末尾元素
void dfs(int a[], bool c[],int now, int last) {
	if (now >= last) {
		cout << "\n{ ";
		for (int i = 0; i < last; i++)
		{
			if (c[i] == true)
				cout << a[i]<<" ";
		}
		cout << "}";
		return;
	}
	c[now] = false;
	dfs(a, c, now + 1, last);
	c[now] = true;
	dfs(a, c, now + 1, last);
}

int main() {
	int n(0);
	cout << "input array length:\n";
	cin >> n;
	int* array = new int[n];
	bool* choose = new bool[n];
	memset(choose, false, n);
	cout << "input array elements:\n";
	for (int i = 0; i < n; i++)
		cin >> array[i];
	cout << "result:";
	dfs(array,choose,0,n);
}
```

#### 全排列问题

分析：从数组首元素开始处理，让他与自己交换位置，然后处理交换位置后的元素，让他与自己交换…最终处理到最后一个元素，由于是与自身交换位置，此时的序列不会有任何改变，因为没有后继元素了，则输出该序列然后回溯到上一层，处理倒数第二的元素，这次让他与倒数第一的元素交换位置（而非自身），此时进入下一层，处理末元素，又得到一组结果，然后再回溯到上上层…

建模：

![](https://s3.bmp.ovh/imgs/2023/11/21/3ef8173d66043f60.png)

代码：

```c++
#include <iostream>
#include <algorithm>
using namespace std;

//now：当前处理的元素 last：数组末尾元素
void dfs(int a[], int now, int last) {
	if (now == last)
	{
		cout << "\n";
		for (int i = 0; i < last; i++)
			cout << a[i] << " ";
		return;//在这里回溯了
	}
	for (int i = now; i < last; i++)
	{
		swap(a[now], a[i]);
		dfs(a, now + 1, last);
		swap(a[now], a[i]);	//当回到当前层，还需要换回，保证是当前处理的元素与后续元素分别交换。再进入下一次循环。
	}
}

int main() {
	int n(0);
	cout << "input array length:\n";
	cin >> n;
	int* array = new int[n];
	cout << "input array elements:\n";
	for (int i = 0; i < n; i++)
		cin >> array[i];
	cout << "result:";
	dfs(array, 0, n);
}
```

比较：

排列树的决策是交换，恢复是换回，子集树的决策是选择是否，恢复是做出另一选择。另外，问题也有维度之分，多维问题，除了dfs本身的层数外，在主要决策处也会有循环试探：N皇后，任务分配。

### 剪枝
为了提高回溯法的时间效率，常常要考虑剪枝，进一步涉及到左子树的剪枝和右子树的剪枝：
对于右子树的剪枝，一般还要额外设置一个函数参数rightIndex。
左子树：一般是无法满足的条件：比如背包问题中剩余重量不够用。
右子树：一般是不用判断，一定满足的条件：比如背包问题中即使后续全选也不会超重。
对于复杂问题，还要专门写出一个剪枝函数prune：比如活动安排问题中的剪枝函数：

### 回溯和深度遍历

可以简略地认为`backtrace=dfs with pruning.`他们本来就很暧昧~

## 子集树

### 01背包

 可以抽象为子集问题，回溯于：是否选择某物品。

> 分析：约束在于总重，优化在于价值。决策将会影响重量和价值，只需要遍历所有的决策组合，约束和优化在最后一层判断。将决策与约束和优化分离后就会清晰很多。感觉不如dp…效率。但是思想也很美~

```c++
#include<iostream>
using namespace std;

const int n = 4;
int W = 6;
//下标为0不考虑，便于叙述 第N个背包和数组下标
int w[n+1] = { 0,5,3,2,1 };
int v[n+1] = { 0,4,4,3,1 };

//最优选择方案和最大价值
bool choose[n+1];
int maxValue=0;

//layer:解集树层次，即正在第LAYER个物品。
//nowChoose现在的选择方案
//nowWeight现在的总重量 nowValue现在的总价值
//leftWeights:剩下的背包的重量，用于剪枝.
void dfs(int layer,bool nowChoose[], int nowWeight, int nowValue,int leftWeights) {
	//n个物品，对每个物品依次进行抉择，最多讨论n层。n层后定结论
	if (layer > n) {
		if (nowWeight == W and nowValue > maxValue) {
			maxValue = nowValue;
			for (int i = 1; i <= n; i++)
				choose[i] = nowChoose[i];
		}
	}
	else {
		//当前总重量加上此物品的重量若>最大能容纳的重量,则不能选这个物品！直接跳过
		nowChoose[layer] = true;
		if (nowWeight+w[layer]<=W) 
			dfs(layer + 1, nowChoose, nowWeight + w[layer], nowValue + v[layer],leftWeights-w[layer]);
		//实际上想表达：若剩下的所有物品的总重量与当前重量的和都要小于最大能容纳的重量，
		//那为了最大价值，自然是希望狂拿的，反正也不会超重.就不会再考虑不拿的情况了.
		nowChoose[layer] = false;
		if (nowWeight+leftWeights >= W) 
			dfs(layer + 1, nowChoose, nowWeight, nowValue,leftWeights-w[layer]);
	}
}

int main() {
	bool nowChoose[n + 1];
	memset(choose, false, n + 1);
	memset(nowChoose, false, n + 1);
	int leftWeight = 0;
	for (int i = 1; i <= n; ++i)
		leftWeight += w[i];
	dfs(1, nowChoose, 0, 0,leftWeight);

	cout << "choose tactic:";
	for (int i = 0; i <= n; i++) {
		if (choose[i] == true)
			cout <<"\n"<<"object" << i << " value: " << v[i] << " weight: " << w[i];
	}
	cout <<"\n" << "maxValue:" << maxValue;
}
```

### 装载和复杂装载

> 一般装载问题：n个集装箱要装入载重为W的轮船，每个箱子重量：w<sub>i</sub> 求最佳装载方案。
>
> 分析：每个货物选或不选。不如背包问题。。。
```c++
#include<iostream>

using namespace std;

const int N = 5;
const int limitedWeight = 10;
const int w[N + 1] = { 0,5,2,6,4,3 };

int maxWeight = 0;
bool choose[N + 1];

void dfs(int layer,bool c[],int nowWeight,int leftWeight) {
	if (layer > N) {
		if (nowWeight > maxWeight && nowWeight<=limitedWeight) {
			maxWeight = nowWeight;
			for (int i = 1; i <= N; i++)
				choose[i] = c[i];	
		}
	}
	else {
		c[layer] = true;
		if (nowWeight + w[layer] <= limitedWeight) 
			dfs(layer+1,c,nowWeight+w[layer],leftWeight-w[layer]);
		c[layer] = false;
		if (nowWeight+leftWeight>limitedWeight) 
			dfs(layer+1,c,nowWeight,leftWeight-w[layer]);
	}
}

int main() {
	bool nowChoose[N+1];
	memset(nowChoose, false, N+1);
	memset(choose, false, N+1);
	int leftWeight = 0;
	for (int i = 1; i <= N; i++)
		leftWeight += w[i];

	dfs(1,nowChoose,0,leftWeight);

	cout << "result:";
	for (int i = 1; i <= N; i++) 
		if(choose[i])
			cout << "\nobject " << i << " selected,weight:" << w[i];
	cout << "\nEngross: " << maxWeight;
}
```



> 复杂装载问题：若有两艘船，找出方案使得所有货物能被运走。在一般装载问题的基础上，先只考虑承重大的那艘船，记为船A，尽可能多地装载，对于没有选中的货物默认装载在第二艘船，记为船B，最终再判断船B能否承受剩余的货物，若能则方案可行，否则没有任何方案能够做到带走这些货物。难点在于证明这个思路的正确性：
>
> 反证法：假如能够运走所有货物，但船A却不是最佳方案（承重尽可能最大）。
>
> 货物总重不变，记最终方案中：船A装载货物总重为L<sub>a</sub>，船B为L<sub>b</sub>，L<sub>a</sub>+L<sub>b</sub>===Sum(W<sub>i</sub>) ,如果方案行得通，说明船B能承受L<sub>b</sub>，那对于比L<sub>b</sub>更小的它自然也能承受，而此时完全可以把货物调度到船A上。
>
> 有了思路后实现就很简单了，在原来的基础上修饰一下就好了。我就不写了，欣赏下书上的写法吧！(#\^_\^#)

```c
#include <stdio.h>
#include <string.h>
#define MAXN 20						//最多集装箱个数
//问题表示
int w[] = { 0,10,40,40 };				//各集装箱重量,不用下标0的元素
int	n = 3;
int c1 = 50, c2 = 50;
int maxw = 0;							//存放第一艘轮船最优解的总重量
int x[MAXN];						//存放第一艘轮船最优解向量
void dfs(int tw, int rw, int op[], int i) //求第一艘轮船的最优解
{
	if (i > n)						//找到一个叶子结点
	{
		if (tw <= c1 && tw > maxw)
		{
			maxw = tw;				//找到一个满足条件的更优解,保存它
			for (int j = 1; j <= n; j++)	//复制最优解
				x[j] = op[j];
		}
	}
	else						//尚未找完所有集装箱
	{
		op[i] = 1;				//选取第i个集装箱
		if (tw + w[i] <= c1)		//左孩子结点剪枝：装载满足条件的集装箱
			dfs(tw + w[i], rw - w[i], op, i + 1);
		op[i] = 0;				//不选取第i个集装箱,回溯
		if (tw + rw > c1)			//右孩子结点剪枝
			dfs(tw, rw - w[i], op, i + 1);
	}
}
void dispasolution(int n)		//输出一个解
{
	for (int j = 1; j <= n; j++)
		if (x[j] == 1)
			printf("\t将第%d个集装箱装上第一艘轮船\n", j);
		else
			printf("\t将第%d个集装箱装上第二艘轮船\n", j);

}
bool solve()			//求解复杂装载问题
{
	int sum = 0;			//累计第一艘轮船装完后剩余的集装箱重量
	for (int j = 1; j <= n; j++)
		if (x[j] == 0)
			sum += w[j];
	if (sum <= c2)			//第二艘轮船可以装完
		return true;
	else				//第二艘轮船不能装完
		return false;
}

void main()
{
	int op[MAXN];				//存放临时解
	memset(op, 0, sizeof(op));
	int rw = 0;
	for (int i = 1; i <= n; i++)
		rw += w[i];
	dfs(0, rw, op, 1);				//求第一艘轮船的最优解
	printf("求解结果\n");
	if (solve())				//输出结果
	{
		printf("    最优方案\n");
		dispasolution(n);
	}
	else
		printf("    没有合适的装载方案\n");
}

```

### N皇后

典中典。抽象为子集问题。回溯在于某坐标是否放置了皇后，难点在于建模，这个问题只有在第一次见的时候会觉得无从下手。

> 分析：问题建模，用一维数组就可以描述棋盘，下标是行，元素值为列，下标+元素值确定一个坐标。用二维数组也可以，但是不简洁而且浪费空间。

```c++
#include<iostream>
#include<math.h>
#include<iomanip>
#include<algorithm>
using namespace std;

int total(0);

void display(int chess[], int n) {
	cout << "No." << ++total<<"\n";
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++)
		{
			if (chess[i] != j)
				cout << setw(2) << "O";
			else
				cout << setw(2) << "*";
		}
		cout << "\n";
	}
};

bool canPlace(int chess[], int n,int x, int y) {
	if (x == 0)
		return true;
	
	//同对角线的处理:|x2-x1|==|y2-y1|!!!! 千万不要写成了|x1-y1|==|x2-y2|!!!
	//后者在正对角线（\，捺）成立是最恶心的，对左对角线不成立！！！！！
	for (int i = 0; i < x; i++)
		if (chess[i]==y || (abs(i-x)==abs(chess[i]-y)))
			return false;

	return true;
};

void dfs(int chess[], int layer, int n) {
	if (layer > n)
		display(chess,n);
	else {
		for (int i = 0; i <n;i++ )
		{
			if (canPlace(chess, n, layer - 1, i))
			{
				chess[layer - 1] = i;
				dfs(chess, layer + 1, n);
			}
		}
	}
};

int main() {
	int n(0);
	cout << "input N:\n";
	cin >> n;
	//一维数组作为棋盘，下标为行，元素值为列
	int* chess = new int[n];
	dfs(chess,1,n);
	cout << "Engross:" << total<<" solutions";
}
```

### Sum100

>设计一个算法在1,2,3..9(顺序不能变)数字之间插入 + 或 - 或什么也不插，使得计算结果为100，并输出所有方案。
>
>分析：输出时机：处理完9且所得结果为100。决策：+ - 空。回溯点：处理完9但结果不为100.
三选一的子集问题抽象。

```c++
#include<iostream>
using namespace std;

const int N = 9;

void dfs(char op[],int sum,int preAdd,int a[],int layer) {
	if (layer == N)
	{
		if (sum == 100)
		{
			cout << a[0];
			for (int j = 1; j < N; j++) {
				if (op[j] != ' ')
					cout << op[j];
				cout << a[j];
			}
			cout << " = 100\n";
		}
		return;
	}
	op[layer] = '+';
	sum += a[layer];
	dfs(op, sum, a[layer], a, layer + 1);
	sum -= a[layer];//恢复状态 回溯处理
	op[layer] = '-';
	sum -= a[layer];
	dfs(op, sum, -a[layer], a, layer + 1);
	sum += a[layer];//恢复状态 回溯处理
	op[layer] = ' ';
	//重点：怎么使得：-5_6=》-56 而5_6=》56 
	//因此需要获取前面的值 为正：pre*10+now 为负：pre*10-now 同时 还要考虑对sum的影响 毕竟替换了一组值
	//可以通过先减去preAdd，处理后形成新的preAdd，再加给sum即可
	sum -= preAdd;
	int newAdd=0;
	if (preAdd > 0)
	{
		newAdd = preAdd * 10 + a[layer];
	}
	else {
		newAdd = preAdd * 10 - a[layer];
	}
	sum += newAdd;
	dfs(op, sum, newAdd, a, layer + 1);
	sum -= newAdd;//此时的恢复也需要引起重视
	sum += preAdd;
}

int main() {
	//要插入的运算符或者空操作可以用N-1长度数组存起来
	char op[N];
	int a[N];
	for (int i = 0; i < N; i++)
		a[i] = i + 1;
	cout << "result:\n";
	//从2开始处理，第一个要处理的操作符也是1和2之间的。
	dfs(op, a[0], a[0], a, 1);
}
```

### 子集和

>经典子集问题，比01背包还简单
```c++
#include<iostream>
using namespace std;

int aimSum = 31;
int const n = 4;
int a[5] = {0,11,13,24,7};

void dfs(bool choose[],int layer,int nowSum,int leftSum) {
	if (layer > n) {
		if (nowSum == aimSum)
		{
			cout << "\n{";
			for (int i = 0; i <= n; i++) {
				if (choose[i] == true)
					cout << a[i] << " ";
			}
			cout << "}";
		}
	}
	else {
		if (nowSum+a[layer]<=aimSum) {
			choose[layer] = true;
			dfs(choose,layer+1,nowSum+a[layer],leftSum-a[layer]);
		}
		//也就是说，如果当前处理的元素不选的话，且以后就算全选也达不到要求，那么就必须选！对于不选的方案，剪掉！
		//注意！！就算不选，leftSum也要减，不选就是错过了，错过了就错过了。。至少在当前世界回不来了，~回溯触发平行时空O(∩_∩)O哈哈~~
		if (nowSum+leftSum>=aimSum) {
			choose[layer] = false;
			dfs(choose, layer + 1, nowSum, leftSum-a[layer]);
		}	
	}
}

int main() {
	bool choose[n+1];
	memset(choose, false, n);
	int sum(0);
	for (int i = 1; i < n + 1; i++)
		sum += a[i];
	cout << "tactics:";
	dfs(choose, 1,0, sum);
}
```

### 任务分配

>n个任务n个人，人和任务的分配只能是1对1的，每个人处理每个任务花费不同，求出最优分配方案。
>
>分析：可抽象为子集型问题。用二维数组存储任务对应的处理人的开销，再设1个一维bool数组存储任务是否分配了，1个一维数组people，下标为人员编号，元素值为任务编号。

```c++
#include<iostream>
using namespace std;

const int N = 4;
int cost[N + 1][N + 1] = {
	{0},
	{0,9,2,7,8},
	{0,6,4,3,7},
	{0,5,8,1,8},
	{0,7,6,9,4}
};

int minCost = 99999;
bool work[N + 1];
int peopleWithTask[N + 1];

//layer表示处理的人员编号
void dfs(int layer,int nowCost,int tactic[]) {
	if (layer > N) {
		if (nowCost < minCost)
		{
			minCost = nowCost;
			for (int i = 1; i < N + 1; ++i)
				peopleWithTask[i] = tactic[i];
		}
	}
	else {
		//依次考虑任务1-N
		for (int i = 1; i <= N; ++i) {
			if (!work[i]) {
				work[i] = true;
				tactic[layer] = i;
				dfs(layer + 1,nowCost+cost[layer][i],tactic);
				work[i] = false;//决策影响了work 和 tactic ，因此都要恢复。
				tactic[layer] = 0;
				//注意：如果这里把nowCost+=cost[][]后，才传入参数，则后面也需要恢复。
				//这里直接把nowCost+cost[][]作为参数，则不用回复。
			}
		}
	}
}

int main() {
	//最优解初始化
	memset(work, false, N + 1);
	memset(peopleWithTask, 0, N + 1);
	//临时解声明和初始化
	int nowCost = 0;
	int nowPeopleWithTask[N + 1];
	memset(nowPeopleWithTask, 0, N + 1);

	dfs(1,nowCost,nowPeopleWithTask);
	
	cout << "allocation strategy：";
	for (int i = 1; i <= N; i++)
		cout << "\ntask: " << i << 
				" allocated to peopel " << peopleWithTask[i] << 
				" costs for: " << cost[i][peopleWithTask[i]];
	cout << "\nEngross:" << minCost;
}
```

### 涂色

>

## 排列树

### 活动安排

>n个活动，每个活动有各自的开始时间和结束时间，活动串行，求最优安排方案——使得能安排最多数量的活动。即求出活动的排列。约束是排列合理（满足串行），优化是排列的数量尽可能多。感觉不如贪心…
>
>分析：在主要决策体中，考虑活动layer—N，分别将layer与其后的活动交换位置，然后判断是否兼容，若兼容则选取更新兼容时间，进入下一层…当回溯到本层，换回位置，执行恢复。
>
>慢到爆炸!对于活动安排问题还是去考虑贪心吧!!!
```c++
#include<iostream>
using namespace std;

struct Activity {
	int begin;
	int end;
};

const int n = 12;
Activity activity[n + 1] = { {0,0},{1,3},{3,4},{0,7},{3,8},{15,19},{15,20},{10,15}, {8,18},{6,12},{5,10}, {4,14},{2,9} };
int maxSum = 0;
int bestSequence[n + 1] = {0,1,2,3,4,5,6,7,8,9,10,11,12};

int lastEnd = 0;//上一个活动的结束时间
int sum=0;
int sequence[n+1]= { 0,1,2,3,4,5,6,7,8,9,10,11,12 };
void dfs(int i)							//搜索活动问题最优解
{
	if (i > n)							//到达叶结点,产生一种调度方案
	{
		if (sum > maxSum)
		{
			maxSum = sum;
			for (int k = 1; k <= n; k++)
				bestSequence[k] = sequence[k];
		}
	}
	else
	{
		for (int j = i; j <= n; j++)				//没有到达叶结点,考虑i到n的活动
		{	//第i层结点选择活动x[j]
			int sum1 = sum;					//保存sum，laste以便回溯
			int laste1 = laste;
			if (activity[sequence[j]].begin >= laste)			//活动x[j]与前面兼容
			{
				sum++;						//兼容活动个数增1
				laste = activity[sequence[j]].end;			//修改本方案的最后兼容时间
			}
			swap(sequence[i], sequence[j]);				//排序树问题递归框架:交换x[i],x[j]
			dfs(i + 1);						//排序树问题递归框架:进入下一层
			swap(sequence[i], sequence[j]);				//排序树问题递归框架:交换x[i],x[j]
			sum = sum1;						//回溯
			laste = laste1;					//即撤销第i层结点对活动x[j]的选择,以便再选择其他活动
		}
	}
}

int main() {
	int nowSequence[n + 1];
	for (int i = 1; i <= n; i++)
		nowSequence[i] = i;
	dfs(1);

	cout << "result:";
	int end = 0;
	for (int i = 1; i <= n; ++i) {
		if (activity[bestSequence[i]].begin >= end) {
			cout << "\n Activity: " << bestSequence[i] <<
				" executed began in " << activity[bestSequence[i]].begin <<
				" ended in " << activity[bestSequence[i]].end;
			end = activity[bestSequence[i]].end;
		}		
	}
	cout<<"\nEngross: "<<maxSum;
}
```



### 流水线作业调度

>n个作业，都要先在机器M1再在M2上进行加工，不同任务在不同机器上加工时间有所不同，确定最佳加工顺序，使得从第一个任务在M1上开始到最后一个任务在M2上结束之间的时间间隔最短。
>
>分析：可抽象为排列类的问题，求一种作业的排列，使得按这样的排列顺序得到的时间间隔最短。作业在M1上是连续的，只要上一个作业执行完毕后，下一个作业就可以去M1上执行了，但是M2的执行可能需要等待，当作业A在M1执行后，进入M2，作业B接着进入M1执行，可能会有作业B在M1上执行完了，作业A在M2上还在执行，因此M2上的时间不连续，存在***等待时间***.因此花在M2上的总时间需要利用数组，而M1不用。重点在于处理等待时间。若要等待，则当前作业i在m2上执行结束的时间time<sub>2</sub>[i]为：time<sub>2</sub>[i]=time<sub>2</sub>[i-1]+m<sub>2</sub>[i]；若不需要等待,则为：time<sub>2</sub>[i]=time<sub>1</sub>[i]+m<sub>2</sub>[i];而真正执行结束的时间应该取二者最大值。即：**time<sub>2</sub>[i]=max{ time<sub>2</sub>[i-1]+m<sub>2</sub>[i] , time<sub>1</sub>[i]+m<sub>2</sub>[i] }**。稍微剪枝一下：若当前方案下的作业i的time2已经超过了之前记录的较优解，则可以直接剪掉了。进一步剪枝：记当前处理的作业为i，已知作业i的time<sub>2</sub>，则time<sub>2</sub>就是前i个作业全部执行完毕的时间，再记录他们在m2上花费的总时间iSum和所有作业在m2上的总时间allSum，则确定一个值：time<sub>2</sub>[i]+allSum-iSum.从i往后确定的每一种方案（叶节点）的最终完成时间一定大于等于该值。因此当确定出该值>目前的bestTime就可以知道，接下来的所有叶子节点对应的值都不可能为打破当前的bestTime，因此可以直接剪掉。

```c
#include <stdio.h>
#include <string.h>
#define INF 0x3f3f3f3f					//最大整数∞					//最多的作业数
#define max(x,y) ((x)>(y)?(x):(y))
//问题表示
const int n = 4;								//作业数
//int m1[n+1] = { 0,5,12,4,8 };				//M1上的执行时间,不用下标0的元素
//int m2[n+1] = { 0,6,2,14,7 };				//M2上的执行时间,不用下标0的元素

//验证升级后的剪枝函数重新设计用例，升级后的剪枝函数能够滤掉大于当前best的值
//但是不巧，上一组用例的依次求出的best正好都是递减的，42-36-34-33 因此不能过滤
//如果交换42 36 的位置就可以使得42被滤掉 因此根据方案挂了一下用例的顺序，发现成功了。
int m1[n + 1] = { 0,5,4,12,8 };				
int m2[n + 1] = { 0,6,14,2,7 };
//求解结果表示
int bestTime;							//存放最优调度时间
int time1;								//M1的执行时间
int time2[n+1];							//M2的执行时间
int x[n+1];							//当前调度方案
int bestx[n+1];						//存放当前作业最佳调度

int allM2Sum = 6 + 2 + 14 + 7;
void swap(int& x, int& y)				//交换x和y
{
	int tmp = x;
	x = y; y = tmp;
}
void disparr(int x[])					//输出数组的元素
{
	for (int i = 1; i <= n; i++)
		printf("%d ", x[i]);
}

int bound(int i) {
	int iM2Sum = 0;
	for (int j = 1; j <= i; j++)
		iM2Sum += m2[x[j]];
	return time2[i] + allM2Sum - iM2Sum;
}
void dfs(int i)						//从第i层开始搜索
{
	if (i > n)							//到达叶结点,产生一种调度方案
	{
		if (time2[n] < bestTime)				//找到更优解
		{
			bestTime = time2[n];
			printf("   一个解: bestf=%d", bestTime);
			printf(", 调度方案: "); disparr(x);
			printf(", time2: "); disparr(time2);
			printf("\n");
			for (int j = 1; j <= n; j++)		//复制解向量
				bestx[j] = x[j];
		}
	}
	else
	{
		for (int j = i; j <= n; j++)			//没有到达叶结点,考虑i到n的作业
		{
			time1 += m1[x[j]];				//在第i层选择执行作业x[j],在M1上执行完的时间
			time2[i] = max(time1, time2[i - 1]) + m2[x[j]];
			//if (time2[i] < bestTime)	//初步剪枝:仅仅扩展当前总时间小于bestf的结点	
			swap(x[i], x[j]);
			if(bound(i)<=bestTime)//下界函数剪枝
			{
				
				dfs(i + 1);
				
			}//关于下界函数剪枝：他需要实时的x数组方案。因此当使用这种方式剪枝时，swap应该放在if外面。
			swap(x[i], x[j]);
			time1 -= m1[x[j]];	//回溯，即撤销第i层对作业x[j]的选择,以便再选择其他作业
		}
	}
}
int main()
{
	time1 = 0;
	bestTime = INF;
	memset(time2, 0, sizeof(time2));
	for (int k = 1; k <= n; k++)  	//设置初始调度为作业1,2,…,n的顺序
		x[k] = k;
	printf("求解过程:\n");
	dfs(1);					//从作业1开始搜索
	printf("求解结果:\n");
	printf("    最少时间: %d", bestTime);
	printf(", 最优调度方案: ");
	disparr(bestx); printf("\n");
	return 0;
}
```

## 见解

在设计dfs时关于回溯恢复的考虑：如果将数据作为函数参数，则可以自动恢复，若不作为参数，而是全局变量，则要手动恢复。

## 非递归回溯

