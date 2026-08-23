---
title: Greedy Algorithm
date: {{date}}
hidden: true
tags:
- 算法基础
- 贪心
- greed
categories:
- [算法, 算法基础]
---

# Greedy Algorithm

> 怎么贪才不会翻车？也是一种艺术。

<!--more-->

## 概述

并非所有问题用贪心都能找到最优解。需要满足两个性质：1.**贪心选择性质**：问题的整体最优解可以通过一系列局部最优的选择来达到，由数学归纳法证明。2.**最优子结构性质**：问题的最优解包含其子问题的最优解，由反证法证明。

解题要点：正确找出贪心的原则。一般是最值优先，因此经常需要排序或者使用优先级队列。

## 活动安排问题

> 无脑列出四个最值：1.最早开始时间优先；2.最晚开始时间优先；3.最早结束时间优先；4.最晚结束时间优先。第2和第4显然不对。考虑方案1和方案3。对于模棱两可的决策，直接考虑对应的极端情况。若有2个活动A：A1[0,24] A2[1,2];若用方案1则最终只能安排一个活动，若用方案2则能完成两个活动。因此这里的贪心原则为：最早结束时间优先。定义一个活动结构体，根据end属性排序即可。

```c++
#include<iostream>
#include<algorithm>
using namespace std;

const int MAX = 20;
const int NUM = 11;
struct Action
{
	int beginTime;
	int endTime;
	bool operator <(const Action& a) {
		return endTime <= a.endTime;
	}
};

void solution(Action a[],bool s[]) {
	sort(a + 1, a + NUM);//1.按贪心原则排序
	int preEndTime = 0;
	for (int i = 1; i < NUM; i++)
	{
		if (a[i].beginTime >= preEndTime)
		{
			s[i] = true;
			preEndTime = a[i].endTime;//2.其他设计
		}
	}
}

void display(Action a[],bool s[]) {
	for (int i = 1; i < NUM; i++)
	{
		if (s[i])
			cout << "Action[" << i << "]选取，开始时间:" << a[i].beginTime << "结束时间：" << a[i].endTime<<endl;
	}
}
int main()
{
	Action test1[NUM] = { {0},{1,4},{3,5},{0,6},{5,7},{3,8},{5,9},{6,10},{8,11},{8,12} ,{2,13} };
    //supposed:{1,4}->{5,7}->{8,11}
	Action test2[NUM] = { {0},{3,9},{0,1},{1,2},{4,5},{12,20},{22,23},{6,7},{1,6},{1,4},{2,3} };
    //supposed:{0,1}->{1,2}->{2,3}->{4,5}->{6,7}->{12,20}->{22,23}
	bool selected1[NUM] = { false };
	bool selected2[NUM] = { false };
	solution(test1,selected1);
	display(test1,selected1);
	cout << "//////////////////"<<endl;
	solution(test2, selected2);
	display(test2, selected2);

}
```

## 背包问题

> 1.最高价值优先；2.最低重量优先；3.最高性价比优先。无脑3.

```c++
#include <iostream>
#include <algorithm>
using namespace std;

//0.背包数据结构，重量和价值，按单位重量价值排序；
//1.对排序好的序列依次取得书包；
//2.对于最后一个书包，可能会出现无法全拿走的情况，因此需要计算能拿走的最大比例；
// 
//notes:这里是按单位重量价值降序排序，但原生的sort函数是升序排列的， 因此需要自定义operator 但是这样会导致语义混乱，因此可以定义一个compare函数，作为sort的参数。
//拿走最后一份（或者比例份）要把MAXWEIGHT归零。
struct Bag {
	double value;
	double weight;
};

struct Take
{
	bool isTaken=false;
	double proportion=0;
};
const int NUM = 5;

bool compare(Bag a, Bag b)
{
	return a.value/a.weight>b.value/b.weight;
}

void solution(Bag b[],Take t[], int M) {
	sort(b, b + NUM,compare);
	for (int i=0;;++i)
	{
		if (M >= b[i].weight)
		{
			t[i].isTaken = true;
			t[i].proportion = 1;
			M -= b[i].weight;

		}//以上为能全部拿走的物品
		//当背包剩余质量低于当前考虑的物品，则只能尽全力充满背包了，
		else if (M != 0)
		{
			t[i].isTaken = true;
			t[i].proportion = M / b[i].weight;
			M = 0;//别忘了M置零！
		}
		else break;
	}
}

void display(Bag b[], Take t[]) {
	double sumValue = 0;
	for (int i = 0; t[i].isTaken; i++)
	{
		cout << "Bag:" << i <<"价值："<<b[i].value<<" 重量:"<<b[i].weight << "被拿走" << t[i].proportion << "份" << endl;
		sumValue += b[i].value * t[i].proportion;
	}
	cout << "总价值为：" << sumValue;
}

int main() {
	Bag Bagtest1[NUM] = { {20,10},{30,20},{66,30},{40,40},{60,50} };
	Take Taketest1[NUM] = {};
	int MaxWeight = 100;
	solution(Bagtest1,Taketest1, MaxWeight);
	display(Bagtest1,Taketest1);
}
```

## 田忌赛马

> 田忌与齐威王赛马，每一局的赢家+1积分 输家-1积分 平局无事发生，田忌如何安排才能获得最多的积分？田忌和齐威王的马们可以用分别用两个数组表示，下标为马的编号，元素值为对应马的速度。先对两组马速度排序，两组双指针，分别指向本组最速のhorse和最慢的马。那么有4种情况：
>
> 1.田最速の马>齐最速の马 （这种情况会出现在齐浪费了他本来最速の马，导致他当前最速の马不如田的）
>
> 此时直接让这两匹马比赛，田田+1.
>
> 2.田最速の马<齐最速の马
>
> 此时让田最拉の马和齐最速の马比，田田-1.
>
> 3.田最速の马=齐最速の马
>
> 这时狗一下，考虑最拉の马：
>
> ​	3.1 田最拉の马>齐最拉の马 
>
> ​	此时直接让这两匹马比赛，田田+1.
>
> ​	3.2 田最拉の马<=齐最拉の马 
>
> ​	此时让田最拉の马和齐最速の马比！田田-1

```c++
#include<iostream>
#include<algorithm>
using namespace std;
//1.Tmax>Qmax::Tmax vs Qmax
//2.Tmax<Qmax:Tmin vs Qmax
//3.Tmax=Qmax:
//	3.1 Tmin>Qmin Tmin vs Qmin
//	3.2 Tmin<Qmin Tmin vs Qmax
//	3.3 Tmin=Qmin Tmin vs Qmax
const int NUM = 5;

void solution(int t[],int q[]) {
	sort(t,t+NUM);
	sort(q,q+NUM);
	int tl = 0, tr = NUM - 1;
	int ql = 0, qr = NUM - 1;
	int score = 0;
	while (tl <= tr)
	{
		if (t[tr] > q[qr])
		{
			cout << "田忌的" << t[tr] << "与齐王的" << q[qr] << "比赛" << endl;
			score += 200;
			tr--;
			qr--;
		}
		else if (t[tr] < q[qr])
		{
			cout << "田忌的" << t[tl] << "与齐王的" << q[qr] << "比赛" << endl;
			score -= 200;
			tl++;
			qr--;
		}
		else
		{
			if (t[tl] > q[ql])
			{
				cout << "田忌的" << t[tl] << "与齐王的" << q[ql] << "比赛" << endl;
				score += 200;
				tl++;
				ql++;
			}
			else
			{
				cout << "田忌的" << t[tl] << "与齐王的" << q[qr] << "比赛" << endl;
				score -= 200;
				tl++;
				qr--;
			}
		}
	}
	cout << score;
}

int main()
{
	int Tian[NUM] = {2,1,5,4,3};//1 2 3 4 5 
	int Qi[NUM] = {2,4,5,3,6};//2 3 4 5 6     score:1-6 2-5 ::-400/// 3-2 4-3 5-4::+600/===+200
	solution(Tian, Qi);
	cout << endl;
	int T2[NUM] = { 1,2,3,4,5 };
	int Q2[NUM] = { 0,1,2,3,4 };
	solution(T2, Q2);
}
```

## 多机调度问题

> n个作业 m台相同的机器 每个作业都有各自的处理用时 并且作业和作业的处理都是原子化的 怎么安排才能在最短时间内完成所有作业的加工？1.最短作业优先 2.最长作业优先 我一开始竟然还认为是最短作业！但其实不是啊，应该是长作业优先！
>
> 分析：给所有作业按执行时长降序排序，然后按照贪心原则依次分配给机器们，这里就考虑到了，倘若机器数大于作业数，那直接将作业分别分配给每个机器就行，如果机器数少于作业数才需要慢慢做，如果将作业，机器，执行时长独立起来将会很乱！也不便于叙述，不如直接将他们对应绑定作为一个数据结构：分配方案allocation。那么最初的排序也要改动成为对allocation数组按照属性time降序排序，然后每一次处理新作业，就将机器编号+1，但是这就考虑到了，如果已经分配完了所有机器，而后续作业将分配给率先完成的那些之前分配的短作业所在的机器号，那么这里的处理就不必+1，而是直接将完成的allocation的机器编号赋值给当前待处理的作业即可。有点乱，整理后，清晰的思路如下：
>
> 思路：数据结构：先定义一个数据结构表示分配方案：作业编号-作业执行时长-为其分配的机器的编号。将分配方案按作业执行时长降序排序。执行算法：先判断作业数量和机器数量的大小关系，如果机器数量更多，可以直接将每个作业分配给这些机器，此情况最终的执行时长就是max <sub>i in all</sub>(allocation[i].time);如果作业更多，那就要先按贪心原则排好序，再一一入队（从0开始，遍历到machineAmount-1），此过程不需要考虑别的，第一轮分配完毕后，为了分配其余的作业（从machineAmount开始，遍历到jobAmount），考虑已经执行完毕了的短作业，最短的作业最先执行完，因此优先出队短作业（这里的队列就要设计成小根堆了），并做相应的数据处理（分析中提到的机器编号的处理），数据处理完毕后再让一个待处理作业入队即可…
>
> 三部曲：1.定义数据结构和compare函数 2.排序和必要处理 3.展示结果

```c++
#include <stdio.h>
#include <queue>
#include <vector>
#include <algorithm>
using namespace std;
//问题表示
int jobAmount = 7;
int machineAmount = 3;
//作业和机器的分配关系
struct allocation
{
	int no;							//作业序号
	int t;							//执行时间
	int mno;						//机器序号
	bool operator<(const allocation& s) const
	{
		return t > s.t;
	}				//按t越小越优先出队 注意这个出队指的是短作业完成的时间顺序，越短越早出队。
};
struct allocation A[] = { {1,2},{2,14},{3,4},{4,16},{5,6},{6,5},{7,3} };
void solution()							
{
	allocation e;
	if (jobAmount <= machineAmount)
	{
		printf("为每一个作业分配一台机器\n");
		return;
	}
	sort(A, A + jobAmount);
	priority_queue<allocation> qu;		//小根堆
	for (int i = 0; i < machineAmount; i++)
	{
		A[i].mno = i + 1;
		printf("  给机器%d分配作业%d,执行时间为%2d,占用时间段:[%d,%d]\n",
			A[i].mno, A[i].no, A[i].t, 0, A[i].t);
		qu.push(A[i]);
	}
	for (int j = machineAmount; j < jobAmount; j++)
	{
		e = qu.top(); qu.pop();			//出队e
		printf("  给机器%d分配作业%d,执行时间为%2d,占用时间段:[%d,%d]\n",
			e.mno, A[j].no, A[j].t, e.t, e.t + A[j].t);
		e.t += A[j].t;
		qu.push(e);						//e进队
	}
}
void main()
{
	printf("tactic:\n");
	solution();
}

```

## Huffman 编码

> 字符集{d1…dn} 他们的对应的频率：{f1…fn}。求最优编码方案。
>
> 分析：先根据初始数据构造huffman树，再根据树求出编码。离散数学和数据结构中都学了huffman树的生成过程：每次选择两个最小频率元素作为叶子，再将它们的和作为根，将这个根作为一个叶子，而构造成此叶子的两个元素不再考虑。循环此过程。根据huffman树的生成过程可以发现贪心策略是：优先考虑最低频率的元素作为叶子节点。可以设置huffman树的节点数据结构TreeNode：包含weight，LC，RC，Parent，aChar。字符aChar和它的权值是最初就能初始化的，其它数据的初始化需要考虑建树的过程,最开始会将三个树结构属性全置为-1。在构造树的过程中再详细赋值。考虑树的构造过程，实际上会频繁比较，如果用排序会很低效，每次构造一个新节点后就排序，而且还要除去之前的两个节点，显然， 用优先级队列可以很轻松地解决，重载<使得按照weight小者优先的 原则进行。首先将所有节点进队(0\~n-1),然后构造(n\~2*n-1),每次构造一个新节点，就将两个节点出队，处理好数据后将新节点入队，就不再需要手动排序了。至此，树就构造好了，接下来就要根据树求编码，对于每一个叶子节点，从它开始依次找到根节点，每当寻根的过程中作为了左孩子，就将编码链接1，否则链接0，最终将这个节点的aChar和构造出的string编码建立映射关系，存入map中，循环如此求出所有字符的编码。最后分别输出。还可以求出wpl，wpl=每个叶子\*他的深度。 
>
> 思路：
>
> 0.数据结构定义：TreeNode { aChar, weight, LC, RC, Parent}和 NodeType{ no, aChar ,weight, override <}
>
> 1.初始化：TreeNode nodes[N]{xxxx};for(nodes 0 to 2n-1){LC=RC=Parent=-1}
>
> 2.建树：for(leaves 0 to n-1){setData push} for(constructor Nodes n to 2n-1){e1pop; e2pop; e1&e2 setData e; push e}
>
> 3.求编码：for(leaves 0 to n-1){ judge(as LC:1 or 0) =>until(root)}, set Map(char,string)}
>
> 4.求wpl：for(leaves 0 to n-1){Sum leafWeight*height }
>
> 5.输出结果：display

```c++
#include<iostream>
#include<map>
#include<queue>
using namespace std;
int n;
const int MAX = 100000;
//四大模块：初始化数据；建树和输出树；建编码并输出编码；计算wpl；
//准备条件：初始化一组编码和他对应的频率（权值）。
//1.构造huffman树：首先将初始化的编码全部入队（0~n），然后从（n~2*n-1）依次构造出整个树，
// 此循环中每次出队（因为以后在构造其他节点时不再考虑）两个最小weight的节点，并利用他们构造出新节点，最为他们的父亲节点
// 2.通过huffman树构造编码：每个字符有其对应的编码，因此用map存放对应关系，
// 从huffman树的叶子开始依次寻到（until）根节点，每次作为左子节点则将编码连接1，否则连接0...每处理一个就建立mapping

struct TreeNode
{
	char aChar;		//字符
	int weight;		//权值：频率
	int parent;
	int lChild;
	int rChild;
};

TreeNode nodes[MAX];
map<char, string> huffmanCode;

struct NodeType		//优先队列结点类型
{
	int no;				//对应哈夫曼树ht中的位置
	char aChar;			//字符
	int  weight;		//权值
	bool operator<(const NodeType& s) const
	{					//用于创建大根堆
		return s.weight < weight;	//weight越小越优先。
	}
};
//构造哈夫曼树
void CreateHTree()
{
	NodeType e, e1, e2;//由最小weight的e1 e2 构造e 
	priority_queue<NodeType> qu;
	for (int k = 0; k < 2 * n - 1; k++)	//设置所有结点的指针域
		nodes[k].lChild = nodes[k].rChild = nodes[k].parent = -1;
	for (int i = 0; i < n; i++)				//将n个结点进队qu
	{
		e.no = i;
		e.aChar = nodes[i].aChar;
		e.weight = nodes[i].weight;
		qu.push(e);
	}
	//关于此处的n 2*n-1 数据结构上有推导
	for (int j = n; j < 2 * n - 1; j++)			//构造哈夫曼树的n-1个非叶结点
	{
		e1 = qu.top();  qu.pop();		//出队权值最小的结点e1
		e2 = qu.top();  qu.pop();		//出队权值次小的结点e2
		nodes[j].weight = e1.weight + e2.weight; //构造哈夫曼树的非叶结点j	
		nodes[j].lChild = e1.no;
		nodes[j].rChild = e2.no;
		nodes[e1.no].parent = j;			//修改e1.no的双亲为结点j
		nodes[e2.no].parent = j;			//修改e2.no的双亲为结点j
		e.no = j;						//构造队列结点e
		e.weight = e1.weight + e2.weight;
		qu.push(e);
	}
}

void CreateHCode()			//构造哈夫曼编码
{
	string code;
	for (int i = 0; i < n; i++)	//构造叶结点i的哈夫曼编码
	{
		code = "";
		int nowNo = i;
		int f = nodes[nowNo].parent;
		while (f != -1)				//循环到根结点
		{
			if (nodes[f].lChild == nowNo)	//当前节点作为父节点的左孩子
				code = '0' + code;
			else					//当前节点作为父节点的右孩子
				code = '1' + code;
			nowNo = f; f = nodes[nowNo].parent;
		}
		huffmanCode[nodes[i].aChar] = code;	
	}
}
void DispHCode()					//输出哈夫曼编码
{
	map<char, string>::iterator it;
	for (it = huffmanCode.begin(); it != huffmanCode.end(); ++it)
		cout << "    " << it->first << ": " << it->second << endl;
}
void DispHTree()					//输出哈夫曼树
{
	for (int i = 0; i < 2 * n - 1; i++)
	{
		printf("    data=%c, weight=%d, lchild=%d, rchild=%d, parent=%d\n",
			nodes[i].aChar, nodes[i].weight, nodes[i].lChild, nodes[i].rChild, nodes[i].parent);
	}
}
int WPL()				//求WPL
{
	int wpl = 0;
	for (int i = 0; i < n; i++)
		wpl += nodes[i].weight * huffmanCode[nodes[i].aChar].size();
	return wpl;
}

int main() {
	n = 5;
	nodes[0].aChar = 'a'; nodes[0].weight = 4;		//置初值即n个叶子结点
	nodes[1].aChar = 'b'; nodes[1].weight = 2;
	nodes[2].aChar = 'c'; nodes[2].weight = 1;
	nodes[3].aChar = 'd'; nodes[3].weight = 7;
	nodes[4].aChar = 'e'; nodes[4].weight = 3;
	CreateHTree();					//建立哈夫曼树
	printf("构造的哈夫曼树:\n");
	DispHTree();
	CreateHCode();					//求哈夫曼编码
	printf("产生的哈夫曼编码如下:\n");
	DispHCode();					//输出哈夫曼编码
	printf("WPL=%d\n", WPL());
}
```

## 流水线作业调度

>一批作业，他们都需要先在机器A上执行，然后再到B上执行，不同作业在不同机器上执行时间不同。该如何贪心呢？假设只有两个作业JobA JobB 他们在AB上的执行时间分别是(a1,b1)和(a2,b2)
>
>1. 作业A先执行
>
>   1. 作业B不必等待=>总时间为a1+a2+b1+b2-b1=>不等待是因为a2>b1
>   2. 作业B需要等待=>总时间为a1+a2+b1+b2-a2=>等待是因为a2<b1
>
>   因此：A先执行的最短时间：a1+a2+b1+b2-min(b1,a2)
>
>2. 作业B先执行
>
>   1. 作业A不必等待=>总时间为a1+a2+b1+b2-b2=>不等待是因为a1>b2
>   2. 作业A需要等待=>总时间为a1+a2+b1+b2-a1=>等待是因为a1<b2
>
>   因此：B先执行的最短时间：a1+a2+b1+b2-min(b2,a1)
>
>综上：最短时间为：a1+a2+b1+b2+max( min(b1,a2) , min(b2,a1) ).根据此思路推导出贪心策略：
>
>1.若a>b 则让b较大的先执行
>
>2.若a<=b 则让a较小的先执行
>
>Johnson算法：
>
>1.将所有作业按照a时间和b时间的大小关系分为两组，一组的作业a<=b，记为G1， 另一组作业a>b，记为G2；
>
>2.G1按a升序排序（最先执行最小a的作业），G2按b降序排序（最先执行最大b的作业）;
>
>3.先执行完毕所有G1组，再执行完所有G2组。
>
>（2.确定组内顺序，3.确定组间顺序，确定顺序后直接执行就能得到最佳调度方案）

```c++
#include <stdio.h>
#include <algorithm> 
using namespace std;
#define max(x,y) ((x)>(y)?(x):(y))
#define N 100
//问题表示
int n=4;
int a[N]={5,12,4,8};				//对应M1的时间
int b[N]={6,2,14,7};				//对应M2的时间
struct NodeType
{
	int no;							//作业序号
    bool group;						//1代表第一组G1,0代表第二组G2
    int time;						//a,b的最小时间
	bool operator<(const NodeType &s) const
	{
		return time<s.time;			//按time递增排序
	}
};
//求解结果表示
int best[N];							//最优调度序列

int solve()								//求解流水作业调度问题
{
	int i,j,k;
	NodeType c[N];
	for(i=0;i<n;i++)					//n个作业中,求出每个作业的最小加工时间 
	{
		c[i].no=i;
		c[i].group=(a[i]<=b[i]);		//a[i]<=b[i]对应第1组G1,a[i]>b[i]对应第0组G2
		c[i].time=a[i]<=b[i]?a[i]:b[i];	//第1组存放a[i],第0组存放b[i]
	}
	sort(c,c+n);						//c元素按time递增排序
	j=0; k=n-1;
	for(i=0;i<n;i++)					//扫描c所有元素,产生最优调度方案
	{
		if(c[i].group==1)				//第1组,按time递增排列放在best的前面部分
			best[j++]=c[i].no;
		else							//第0组,按time递减排列放到best的后面部分
			best[k--]=c[i].no;
	}
	int f1=0;							//累计M1上的执行时间
	int f2=0;							//最优调度下的消耗总时间
	for(i=0;i<n;i++)
	{
		f1+=a[best[i]];
		f2=max(f2,f1)+b[best[i]];
    }
	return f2;
}
void main()
{
	printf("求解结果\n");
	printf("    总时间: %d\n",solve());	//输出:33
	printf("    调度方案: ");
	for(int i=0;i<n;i++)
		printf("%d ",best[i]+1);		//输出:3 1 4 2
	printf("\n");
}
```



