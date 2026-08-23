---
title: Branch&Bound
date: {{date}}
hidden: true
tag:
- 算法
- 分支限界
categories:
- [算法, 算法基础]
---

# Branch&Bound

## 概述

与回溯法的区别：回溯法掌握穿越时空技术可以遍历所有的解集。而分支限界掌握预知能力，能提前看清unpromising解并跳过他的求解过程，只专注于最优解，也正是他傲慢和无情地依靠自己的预知，他无法遍历所有的解(除非他的预知太烂了！或者解空间本来就很小)。回溯法依次看到每种结局再回退(dfs)，分支限界放眼所有情况但只考虑最有希望的节点(bfs)，按照自己的预测方式走下去,如果预测方式刁钻(优先队列),他在解空间上的遍历还会是跳跃的，运气好的话他甚至能直接找到最优解。

## 01背包

用分支限界写01背包，普通队列：

准备一个队列和三个队列节点:分别表示根节点，左子节点(选择了该层对应的背包)，右子节点(未选择该层对应的背包)。初始化根节点，根节点入队，队不空则循环：{ 出队并记录该节点于e节点(子也将成为父,因此将信息保存到e很合理！),然后考虑左子结点，先剪枝超重的情况,若未超重,则为e1赋数据并判断上界后入队或剪枝 。在考虑右子节点，赋予数据并求上界后入队或剪枝}

```c++
#include<queue>
#include<iostream>
using namespace std;

int W = 6;
const int n = 4;
const int MAX = 20;
int total = 1;

int w[] = { 0,5,3,2,1 };			
int v[] = { 0,4,4,3,1 };

int maxValue = -1;
int tatic[MAX];

struct NodeType {
	int no;
	int layer;
	int weight;
	int value;
	double upper;
	int x[MAX];
};

void EnQueue(queue<NodeType> &q,NodeType e) {
	if (e.layer == n) {
		if (e.value > maxValue)
		{
			maxValue = e.value;
			for (int i = 1; i <= n; i++)
				tatic[i] = e.x[i];
		}
	}
	else
		q.push(e);
}

void bound(NodeType& e) {
	double nowV = e.value; int nowW = e.weight; int layer = e.layer+1;
	while (layer <= n && nowW + w[e.layer] <= W) {
		nowV += v[layer];
		nowW += w[layer];
		layer++;
	}
	if (layer <= n)
		e.upper = nowV + (v[layer] / w[layer]) * (W - nowW);
	else
		e.upper = nowV+ v[layer];
}

void bfs() {
	
	NodeType e, e1, e2; queue<NodeType> q;
	e.value = 0; e.weight = 0; e.layer = 0; e.no = total++;
	for (int i = 1; i <= n; i++)
		e.x[i] = 0;
	/*bound(e);*/
	q.push(e);
	
	while (!q.empty()) {
		e = q.front(); q.pop();
		if (e.weight + w[e.layer + 1] <= W) {
			e1.no = total++;
			e1.layer = e.layer + 1;
			e1.weight = e.weight + w[e1.layer];
			e1.value = e.value + v[e1.layer];
			for (int i = 1; i <= n; i++)
				e1.x[i] = e.x[i];
			e1.x[e1.layer] = 1;
			bound(e1);
			if(e1.upper>maxValue)
				EnQueue(q, e1);
		}
		e2.no = total++;
		/*e2.layer = e1.layer;*/ //错误 不能以e1为基准，因为可能没有e1
		e2.layer = e.layer + 1;
		e2.value = e.value; e2.weight = e.weight;
		for (int i = 1; i <= n; i++)
			e2.x[i] = e.x[i];
		e2.x[e2.layer] = 0;
		bound(e2);
		if (e2.upper > maxValue)
			EnQueue(q, e2);
	}
}

int main() {
	bfs();
	for (int i = 1; i <= n; i++)
		if (tatic[i])
			cout << "选择物品 " << i<<" 价值为："<<v[i]<<" 重量为："<<w[i]<<"\n";
	cout << "总价值为：" << maxValue;
}
```

优先级队列：

队列不再按FIFO顺序，而按高upper优先，因此能更快搜索到最优解。只需要将队列换成优先级队列，重载NodeType<运算符：`return upper< anotherE.upper` 使满足大upper优先。

## 任务分配

优先级队列解法：优先出队最小的可能cost 即优先出队最小下界

```c++
#include<iostream>
#include<queue>
using namespace std;

const int INF = 0x3f3f3f3f;
const int MAX = 200;
const int n = 4;
int c[MAX][MAX] = { {0}, {0,9,2,7,8},{0,6,4,3,7},{0,5,8,1,8},{0,7,6,9,4} };
int tactic[MAX];
int minCost=INF;
int total = 1;

struct NodeType
{
	int layer;
	int no;
	int cost;
	bool worker[MAX];		//worker[i]=true表示任务i已经分配
	double lower;
	int tactic[MAX];		//x[i]为人员i分配的任务编号
	bool operator <(const NodeType& aNode)const {
		return lower>aNode.lower;
	}
};

void bound(NodeType &e) {
	int lower = 0;
	for (int i = e.layer + 1; i <= n; i++) {
		int nowMinCost = INF;
		for (int j = 1; j <= n; j++)
			if (e.worker[j] == false && c[i][j] < nowMinCost)
				nowMinCost = c[i][j];
		lower += nowMinCost;
	}
	e.lower =e.cost+lower;
}

void bfs() {
	NodeType e, e1;
	priority_queue<NodeType> q;
	e.cost = 0; e.layer = 0; e.no = total++;
	memset(e.tactic, 0, sizeof(e.tactic));
	memset(e.worker, 0, sizeof(e.worker));
	q.push(e);
	while (!q.empty()) {
		e = q.top(); q.pop();
		if (e.layer == n) {
			if (e.cost < minCost) {
				minCost = e.cost;
				for (int i = 1; i <= n; i++)
					tactic[i] = e.tactic[i];
			}
		}
		e1.layer = e.layer + 1;
		for (int i = 1; i <= n; i++) {
			if (e.worker[i])	continue;		//若任务已经分配则跳过
			e1.no = total++;
			for (int i = 1; i <= n; i++) { e1.tactic[i] = e.tactic[i]; e1.worker[i] = e.worker[i]; }
			e1.tactic[e1.layer] = i; e1.worker[i] = true;
			e1.cost = e.cost + c[e1.layer][i];
			bound(e1);
			if (e1.lower < minCost)
				q.push(e1);
		}
	}
}

int main() {
	bfs();
	cout << "最佳安排方案：";
	for (int i = 1; i <= n; i++)
		cout << "\n给第" << i << "个人分配任务" << tactic[i]<<" 成本为："<<c[i][tactic[i]];
	cout << "\n总成本为：" << minCost;
}
```

## 流水线调度

建议johnson算法。这里采用优先级队列写出：

分析：与任务分配几乎相同的写法，流水线调度之前就分析过`f1=f1+a[i];f2=max(f1,f2[i-1]+b[i])`设问题的解集树的层数表示当前处理的步骤：根节点(无实际意义)，叶节点(处理的最后一步,得到了一组完整方案),因此当程序执行到解集树中某个节点时,考虑当前还没有完成的作业(因此需要设计一个bool数组表示每个作业是否完成了),将这些作业的b时间累加起来就是当前节点的下界，如果该下界还小于已经求出了的minTime的话,就可以果断剪枝了。同时,也知道了,优先出队下界小的节点。

思路：首先设置节点类型结构体：包括 当前节点的解向量int[]，当前节点的作业完成情况bool[],当前节点的下界,当前节点的层数,a时间累计(f1),b时间累计(f2),操作符重载,还可以增设一个节点编号,可以统计节点数量。然后将根节点初始化并进队,然后只要队不空就循环,在任务分配问题中,进入循环后就判断出队的节点的层数,若为叶节点就输出,实际上,在一个节点产生时就已经可以根据其layer判断是否为叶节点了，因此叶节点其实不必进队！这里将对这一部分进行优化，后续的操作无非复制父节点数据，修改关键数据并判断。此问题的限界函数更简单，只要遍历未完成的任务，将任务的b时间累加加加上当前节点的f2就可以得到下界了。

```c++
#include <stdio.h>
#include <string.h>
#include <queue>
using namespace std;
#define max(x,y) ((x)>(y)?(x):(y))
#define INF 0x3f3f3f3f			//定义∞
#define MAX 21
//问题表示
int n=4;							//作业数
int a[MAX]={0,5,12,4,8};			//M1上的执行时间,不用下标0的元素
int b[MAX]={0,6,2,14,7};			//M2上的执行时间,不用下标0的元素

//int a[MAX]={0,5,10,9,7};			//M1上的执行时间,不用下标0的元素
//int b[MAX]={0,7,5, 9,8};			//M2上的执行时间,不用下标0的元素

//求解结果表示
int bestf=INF;						//存放最优调度时间
int bestx[MAX];						//存放当前作业最佳调度
int total=1;						//结点个数累计
struct NodeType					//队列结点类型
{
	int no;						//结点编号
	int x[MAX];					//x[i]表示第i步分配作业编号
	int y[MAX];					//y[i]=1表示编号为i的作业已经分配
	int i;						//步骤编号
	int f1;						//已经分配作业M1的执行时间
	int f2;						//已经分配作业M2的执行时间
	int lb;						//下界
	bool operator<(const NodeType &s) const	//重载<关系函数
	{
		return lb>s.lb;			//lb越小越优先出队
	}
};
void bound(NodeType &e)				//求结点e的限界值	
{
	int sum=0;
	for (int i=1;i<=n;i++)				//扫描所有作业
		if (e.y[i]==0) sum+=b[i];		//仅累计e.x中还没有分配的作业的b时间
	e.lb=e.f1+sum;
}
bool has(NodeType e,int j)			//作业j是否已经分配
{
	for (int i=1;i<=n;i++)
		if (e.x[i]==j)
			return true;
	return false;
}
void bfs()								//求解流水作业调度问题
{
	NodeType e,e1;
	priority_queue<NodeType> qu;
	memset(e.x,0,sizeof(e.x));			//初始化根结点的x
	memset(e.y,0,sizeof(e.y));			//初始化根结点的y
	e.i=0;								//根结点
	e.f1=0;
	e.f2=0;
	bound(e);
	e.no=total++;
	qu.push(e);							//根结点进队列
	while (!qu.empty())
	{
		e=qu.top(); qu.pop();			//出队结点e
		e1.i=e.i+1;						//扩展分配下一个步骤的作业，对应结点e1
		for (int j=1;j<=n;j++)				//考虑n个作业
		{
			if (e.y[j]==1) continue;		//作业j是否已分配,若已分配，跳过
			for (int i1=1;i1<=n;i1++)	//复制e.x得到e1.x
				e1.x[i1]=e.x[i1];
			for (int i2=1;i2<=n;i2++)		//复制e.y得到e1.y
				e1.y[i2]=e.y[i2];
			e1.x[e1.i]=j;					//为第i步分配作业j
			e1.y[j]=1;					//表示作业j已经分配
			e1.f1=e.f1+a[j];
			e1.f2=max(e.f2,e1.f1)+b[j];
			bound(e1);
			if (e1.i==n)						//达到叶子结点
			{
				if (e1.f2<bestf)				//比较求最优解
				{
					bestf=e1.f2;
					for (int j1=1;j1<=n;j1++)
						bestx[j1]=e1.x[j1];
					return;						//找到一个解后结束
				}
			}
			if (e1.f2<=bestf)					//剪枝
			{
				e1.no=total++;					//结点编号增加1
				qu.push(e1);
			}
		}
	}
}
void main()
{
	bfs();
	printf("最优方案:\n");
	for (int k=1;k<=n;k++)
		printf("   第%d步执行作业%d\n",k,bestx[k]);
	printf("   总时间=%d\n",bestf);
}
```

## 图的单源最短路径

o(*￣︶￣*)o
