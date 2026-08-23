---
title: Divide&Conquer
date: {{date}}
hidden: true
tag:
- 算法基础
- 分治
- DC
categories:
- [算法, 算法基础]
---

# Divide&Conquer

> 思想只能作为指导 实践中的细节才是魔鬼藏身之处——二分边界问题 

<!--more-->

## 排序

### 快速排序

```c++
void quick_sort(int q[], int l, int r)
{
    if (l >= r) return;

    int i = l - 1, j = r + 1, x = q[l + r >> 1];
    while (i < j)
    {
        do i ++ ; while (q[i] < x);
        do j -- ; while (q[j] > x);
        if (i < j) swap(q[i], q[j]);
    }
    quick_sort(q, l, j), quick_sort(q, j + 1, r);
}
```

变式：第K 大/小 数

### 归并排序

两种写法:

1. 自顶向下：简洁 可读性好
   
   ```c++
   #include <iostream>
   using namespace std;
   
   int NUM[10] = { 10,9,7,8,6,5,4,4,1,2 };
   void display(int a[], int n) {
   	int i(0);
   	while (i < n)
   		cout << a[i++] << " ";
   }
   
   void Merge(int a[], int l, int mid, int r) {
   	int* b = new int[r - l + 1];
   	int b_index = 0;
   	int left = l; int right = mid + 1;
   	//判断并复制
   	while (left <= mid and right <= r) {
   		if (a[left] < a[right]) b[b_index++] = a[left++];
   		else  b[b_index++] = a[right++];
   	}
   	//多余元素全部复制
   	while (left <= mid)	b[b_index++] = a[left++];
   	while (right <= r)	b[b_index++] = a[right++];
   	//复制临时数组序列给原数组
   	int start = l;
   	for (int b_index_this = 0; start <= r; start++)
   		a[start] = b[b_index_this++];
   	delete[] b;
   }
   void MergeSort(int a[], int l, int r) {
   	if (l < r) {
   		int mid = l + r >> 1;
   		MergeSort(a,l,mid);
   		MergeSort(a,mid+1,r);
   		Merge(a,l,mid,r);
   	}
   }
   
   int main() {
   	MergeSort(NUM, 0, 9);
   	display(NUM,10);
   }
   ```
   
2. 自底向上：高效 但要考虑的细节多 较繁琐
   
   ```c++
   #include<iostream>
   #include<algorithm>
   using namespace std;
   int NUM[10] = { 10,9,7,8,6,5,4,4,1,2 };
   int times = 1;
   
   void merge(int a[], int i, int mid, int j) {
   	int* b = new int[j - i + 1];
   	int b_index = 0;
   	int left = i; int right = mid + 1;
   	//判断并复制
   	while (left <= mid and right <= j) {
   		if (a[left] < a[right]) b[b_index++] = a[left++];
   		else  b[b_index++] = a[right++];
   	}
   	//多余元素全部复制
   	while (left <= mid)
   		b[b_index++] = a[left++];
   	while (right <= j)
   		b[b_index++] = a[right++];
   	//复制临时数组序列给原数组
   	int start = i;
   	for (int b_index_this = 0; start <= j; start++)
   		a[start] = b[b_index_this++];
   	delete[] b;
   }
   
   void mergePass(int a[], int len, int n) {
   	int index(0);
   	//合并相邻表，若能够合并，当前表下标，加上连续两个表长后的下标小于末尾下标，则合并。
   	for (; index + 2 * len - 1 < n; index += 2 * len)
   		merge(a, index, index + len - 1, index + 2 * len - 1);
   	//考虑最后一个轮空的表，其长度会较小，因此当满足index+2*len-1>n and index + len -1<n 则说明有小表，小表的末尾就是n-1.
   	if (index + len - 1 < n)
   		merge(a, index, index + len - 1, n - 1);
   }
   
   void mergeSort(int a[], int n) {
   	//循环的增长与归并算法的趟数有关
   	for (int len = 1; len < n; len *= 2)
   		mergePass(a, len, n);
   }
   
   void display(int a[], int n) {
   	int i(0);
   	while (i < n)
   		cout << a[i++] << " ";
   }
   
   int main() {
   	mergeSort(NUM,10);
   	display(NUM, 10);
   	return 1;
   }
   ```

## 查找

### 第K小

用快排的思想写是最好的。

画数轴确定递归的判断条件：

```c++
int quick_sort(int q[], int l, int r, int k)
{
    if (l >= r) return q[l];

    int i = l - 1, j = r + 1, x = q[l + r >> 1];
    while (i < j)
    {
        do i ++ ; while (q[i] < x);
        do j -- ; while (q[j] > x);
        if (i < j) swap(q[i], q[j]);
    }

    if (j - l + 1 >= k) return quick_sort(q, l, j, k);
    else return quick_sort(q, j + 1, r, k - (j - l + 1));
}
```

### 等长有序序列中位数

> 两个等长序列A B，求他们的中位数。（递增序列）

分析：

1. 若A B只有一个元素， 取较小者； 
2. 若A B有多个元素，则分别求出A B的中位数，若二者中位数相同，那就是最终答案，若不同：
   1. 若A的中位数>B的中位数：限制AB序列，取A前半段，B后半段，然后递归；
   2. 若A的中位数<B的中位数：限制AB序列，取A后半段，B前半段，然后递归；

```c
#include <stdio.h>
void prepart(int &s,int &t)			//求a[s..t]序列的前半子序列
{	int m=(s+t)/2;
	t=m;
}
void postpart(int &s,int &t)		//求a[s..t]序列的后半子序列
{	int m=(s+t)/2;
	if ((s+t)%2==0)					//序列中有奇数个元素
		s=m;
	else							//序列中有偶数个元素
		s=m+1;
}
void display(int a[],int s,int t)
{
	for (int i=s;i<=t;i++)
		printf("%d ",a[i]);
	printf("\t");
}
int midnum(int a[],int s1,int t1,int b[],int s2,int t2)
{	//求两个有序序列a[s1..t1]和b[s2..t2]的中位数
	int m1,m2;
	if (s1==t1 && s2==t2)	//两序列只有一个元素时返回较小者
		return a[s1]<b[s2]?a[s1]:b[s2];
	else
	{	m1=(s1+t1)/2;				//求a的中位数
		m2=(s2+t2)/2;				//求b的中位数
		if (a[m1]==b[m2])			//两中位数相等时返回该中位数
			return a[m1];
		if (a[m1]<b[m2])			//当a[m1]<b[m2]时
		{	postpart(s1,t1);		//a取后半部分
			prepart(s2,t2);			//b取前半部分
			printf("a:"); display(a,s1,t1);
			printf("b:"); display(b,s2,t2);
			printf("\n");
			return midnum(a,s1,t1,b,s2,t2);
		}
		else						//当a[m1]>b[m2]时
		{	prepart(s1,t1);			//a取前半部分
			postpart(s2,t2);		//b取后半部分
			printf("a:"); display(a,s1,t1);
			printf("b:"); display(b,s2,t2);
			printf("\n");
			return midnum(a,s1,t1,b,s2,t2);
		}
	}
}
void main()
{
	int a[]={1,3,5,7};
	int b[]={2,4,6,8};
	//int a[]={1,3,4,6,9};
	//int b[]={2,3,5,8,10};
	int n=sizeof(a)/sizeof(a[0]);
	printf("中位数:%d\n",midnum(a,0,n-1,b,0,n-1));
}

```

### 二分

#### 整数二分

区间是 [L,MID-1]  则mid=l+r+1>>1 满足条件 L=mid 因为右侧是[mid,R]

区间是[L,MID] 则mid=l+r>>1 满足条件 R=mid 因为左侧是[L,mid]

```c++
bool check(int x) {/* ... */} // 检查x是否满足某种性质

// 区间[l, r]被划分成[l, mid]和[mid + 1, r]时使用：
int bsearch_1(int l, int r)
{
    while (l < r)
    {
        int mid = l + r >> 1;
        if (check(mid)) r = mid;    // check()判断mid是否满足性质
        else l = mid + 1;
    }
    return l;
}
// 区间[l, r]被划分成[l, mid - 1]和[mid, r]时使用：
int bsearch_2(int l, int r)
{
    while (l < r)
    {
        int mid = l + r + 1 >> 1;
        if (check(mid)) l = mid;
        else r = mid - 1;
    }
    return l;
}
```

#### 浮点数二分

```c++
bool check(double x) {/* ... */} // 检查x是否满足某种性质

double bsearch_3(double l, double r)
{
    const double eps = 1e-6;   // eps 表示精度，取决于题目对精度的要求
    while (r - l > eps)
    {
        double mid = (l + r) / 2;
        if (check(mid)) r = mid;
        else l = mid;
    }
    return l;
}
```

## 组合

### 棋盘覆盖

> 2<sup>n</sup>规模的棋盘中，有一个特殊块，用L型骨牌填满棋盘，围住特殊块。

分析：为什么用分治法可以完成？因为当棋盘很小时，可以很简单的求出来，那么问题就在于划分棋盘，每次都将棋盘划分为四个小棋盘，说着很简单，但其实最重要的不在于单纯的划分，因为按照一开始所说，棋盘很小时问题很容易解决(一个特殊块的2*2棋盘 只需要一个L型骨牌即可)，这其实意味着棋盘即使很小，但也要**存在**那个特殊块，但目前只有一个特殊块，而棋盘却又很大，因此不仅需要划分，还要在每次划分时选定一个特殊块，而对于本问题，L型骨牌其实就是我们手动构造出来的特殊块了，因为每次划分为4份小棋盘，而其中一份必然是特殊块所在的，其余三个棋盘就没有特殊块了，因此需要为他们添加特殊块，问题来了，构造的特殊块应该放在哪里呢？实际上，放在三个棋盘的交接处即可，这样也就构造了L型骨牌，依次类推..最终一定能填满。

最复杂的就是分析交接处，要判断不同的象限，将特殊块放在不同的位置：右下，左下，右上，左上。但其实在构造的过程中很容易发现规律，发现规律后就可以直接套了，规律见注释`确定是否+1`处

```c++
#include<iostream>
#include<algorithm>
#include<iomanip>
using namespace std;
const int MAX = 1024;
int Board[MAX][MAX];
int num= 1;
//棋盘问题总结，根据所在区域不同，确定不同操作。
//较复杂的是定位，但是在分析过程中，发现很多定位信息是共通的。
//脑海中要有草图，特别是三个临界点， 因此其实每种情况都可以根据草图由其他情况的坐标确定是否+1来决定
//关于坐标，不要想着x轴y轴，去想行和列，同一行，则行坐标不变，同一列，则列坐标不变！

void ChessBoard(int speRow, int speCol, int relaRow, int relaCol, int size) {
	int t=num++;
	int smallSize = size / 2;
	if (size == 1)return;
	//if在左上区域
	if (speCol < relaCol + smallSize and speRow < relaRow + smallSize) {
		ChessBoard(speRow, speCol, relaRow, relaCol, smallSize);
	}
	else//在左上区域的右下角添加假的特殊骨牌，并且对这个骨牌求解
	{
		Board[relaRow+smallSize-1][relaCol+smallSize-1] = t;
		ChessBoard(relaRow + smallSize - 1, relaCol + smallSize - 1,relaRow,relaCol,smallSize);
	}
	//if在右上区域
	if (speCol >= relaCol + smallSize and speRow < relaRow + smallSize) {
		ChessBoard(speRow, speCol, relaRow, relaCol + smallSize,smallSize);
	}
	else//在右上区域的左下角添加假的特殊骨牌，并且对这个骨牌求解
	{
		Board[relaRow + smallSize - 1][relaCol + smallSize] = t;
		ChessBoard(relaRow + smallSize - 1, relaCol + smallSize, relaRow, relaCol + smallSize, smallSize);
	}
	//if在左下区域
	if (speCol < relaCol + smallSize and speRow >= relaRow + smallSize) {
		ChessBoard(speRow, speCol, relaRow + smallSize, relaCol, smallSize);
	}
	else//在左下区域的右上角添加假的特殊骨牌，并且对这个骨牌求解
	{
		Board[relaRow + smallSize ][relaCol + smallSize - 1] = t;
		ChessBoard(relaRow + smallSize, relaCol + smallSize - 1, relaRow + smallSize, relaCol, smallSize);
	}
	//if在右下区域
	if (speCol >= relaCol + smallSize and speRow >= relaRow + smallSize) {
		ChessBoard(speRow, speCol, relaRow + smallSize, relaCol + smallSize, smallSize);
	}
	else//在右下区域的左上角添加假的特殊骨牌，并且对这个骨牌求解
	{
		Board[relaRow + smallSize][relaCol + smallSize ] = t;
		ChessBoard(relaRow + smallSize, relaCol + smallSize, relaRow + smallSize, relaCol + smallSize, smallSize);
	}
}

int main() {
	int size(0), x(0), y(0);
	cout << "input size(),x,y:";
	cin >> size >> x >> y;
	size = 1 << size;
	ChessBoard(x, y, 0, 0, size);
	for (int i = 0; i < size; i++) {
		for (int j = 0; j < size; j++)
			cout << setw(5) << Board[i][j];
		cout << endl;
	}
}
```

### 循环日程

> n=2<sup>k</sup>个选手，在n-1天内彼此都比赛一次，求日程表。
>
> 设表格行代表第i个 选手 行的下标从1开始，列代表天数 下标从0开始 那么日程二维表的第一列（下标为0）用来显示行号，以此来表示选手的编号，从第二列（下标为1）开始，元素值表示选手的对手，下标代表比赛的天数。
>
> 比如S\[0\]\[0\] 代表第一个选手第0天 第0天没有意义 此时为第一列 不如填入选手的编号1
>
> S\[1\]\[1\]代表第二个选手第1天要对阵的人 S\[4\]\[6]代表第五个选手 第六天要对阵的人
>
> 为什么说此问题可以用递归解决呢，首先问题规模很小时，当然可以解决，于是第一个性质就满足了，那如何由小问题推出大问题呢？实际上本题的选手数为2的幂，因此选手规模只能成2倍的增长，而对于两倍的增长，这个二维表数据是可以复用的。

```c++
#include <stdio.h>
#define MAX 101
//问题表示
int k;
//求解结果表示
int a[MAX][MAX];						//存放比赛日程表（行列下标为0的元素不用）
void Plan(int k)
{
	int i,j,n,t,temp;
	n=2;								//n从2^1=2开始
	a[1][1]=1; a[1][2]=2;   			//求解2个选手比赛日程,得到左上角元素
	a[2][1]=2; a[2][2]=1;
	for (t=1;t<k;t++)						//迭代处理,依次处理2^2(t=1)…,2^k(t=k-1)个选手
	{
		temp=n;								//temp=2^t
		n=n*2; 								//n=2^(t+1)
		for (i=temp+1;i<=n;i++ )			//填左下角元素
			for (j=1; j<=temp; j++)
				a[i][j]=a[i-temp][j]+temp; 	//左下角元素和左上角元素的对应关系
		for (i=1; i<=temp; i++)				//填右上角元素
			for (j=temp+1; j<=n; j++)
				a[i][j]=a[i+temp][(j+temp)% n];
		for (i=temp+1; i<=n; i++)			//填右下角元素
			for (j=temp+1; j<=n; j++)
				a[i][j]=a[i-temp][j-temp];
    }
}
void main()
{
	k=3;
	int n=1<<k;							//n等于2的k次方即n=2^k
	Plan(k);							//产生n个选手的比赛日程表
	for(int i=1; i<=n; i++)				//输出比赛日程表
	{	for(int j=1; j<=n; j++)
			printf("%4d",a[i][j]);
		printf("\n");
	}
}
```

### 最大连续子序列和

> 用dp最好 但还是介绍一下DC吧

分析：对于一个序列，将它分为左右两边，那么那段最大连续子序列要么在纯左侧，要么在纯右侧，要么就横跨左右两侧，对于横跨左右两侧的情况，只需要从中点开始，往左右两侧蔓延判断即可。这是宏观上的划分。具体而言，真正能一口气确定要不要选择某个元素是在只有一个元素时，元素>0就选择，否则就不选，当序列稍微有点长，就要开始斟酌了，但这是计算机需要考虑的，因为每一次递归，都要在divided的序列中求这三种情况，疯狂套娃，直到能轻而易举地conquer，最终再合并，就能conquer最终的大问题。

```c++
#include<iostream>
#include<algorithm>
using namespace std;

int max3(int a,int b,int c){
	return c > (a > b ? a : b) ? c : (a > b ? a : b);
}

int MaxSubSeq(int a[], int low, int high) {
	int leftSum(0), rightSum(0), midSum(0), maxMid_leftSum(0), maxMid_rightSum(0);
	if (low == high)
	{
		if (a[low] > 0)
			return a[low];
		else
			return 0;
	}
	else {
		int mid = ( low + high )/ 2;
		leftSum = MaxSubSeq(a, low, mid );
		rightSum = MaxSubSeq(a, mid + 1, high);
		int mid_leftSum(0), mid_rightSum(0);
		//i=mid 往左侧蔓延
		for (int i = mid; i >= low; i--)
		{
			mid_leftSum += a[i];
			if (mid_leftSum > maxMid_leftSum)
				maxMid_leftSum = mid_leftSum;
		}
		//i=mid+1 往右侧蔓延
		for (int i = mid+1; i <= high; i++) {
			mid_rightSum += a[i];
			if (mid_rightSum > maxMid_rightSum)
				maxMid_rightSum = mid_rightSum;
		}
		midSum = maxMid_leftSum + maxMid_rightSum;
		return max3(leftSum, rightSum, midSum);
	}
}

int main() {
	int a[] = { -2,11,-4,13,-5,-2 },n=6;
	cout << MaxSubSeq(a, 0, 5);
}
```



## 大整数乘法

> 求两个二进制的数的乘积（这两个二进制数很长很大）
>
> 分析：将两个二进制数分为两段。记这两个二进制数分别为A,B则要求A*B 可以把A的高n/2位取出，记为a1，低n/2位取出，记为a2，因此A=a1\*2<sup>n/2</sup>+a2,同理B=b1\*2<sup>n/2</sup>+b2,因此A\*B=(a1\*2<sup>n/2</sup>+a2)\*(b1\*2<sup>n/2</sup>+b2)=a1\*b1\*2<sup>n</sup>+(a1\*b2+a2\*b1)\*2<sup>n/2</sup>+a2\*b2。
>
> 思路：
>
> 1. 初始化A B的字符串 并将字符串转为整数数组。
> 2. 递归将两个数组分别拆为前后两段，代表高位和低位。出口：数组长度为1，此时可以计算出结果并返回给上一层。回归处理：将得到的四个结果转为10进制并做分析中的计算A\*B=(a1\*2<sup>n/2</sup>+a2)\*(b1\*2<sup>n/2</sup>+b2)=a1\*b1\*2<sup>n</sup>+(a1\*b2+a2\*b1)\*2<sup>n/2</sup>+a2\*b2；再将该结果转换为2进制。层层返回，最终得到一个二进制的结果。

```c++
//求解大整数乘法的算法
#include <stdio.h>
#include <math.h>
#define MAXN 2000				//最多的位数
void Left(int A[],int B[],int n)	//取A的左边（高位）n/2位
{	int i;
	for (i=0;i<MAXN;i++)
		B[i]=0;
	for (i=n/2;i<=n;i++)
		B[i-n/2]=A[i];
}
void Right(int A[],int B[],int n)//取A的右边（低位）n/2位
{	int i;
	for (i=0;i<MAXN;i++)
		B[i]=0;
	for (i=0;i<n/2;i++)
		B[i]=A[i];
	B[i]='\0';
}
long Trans2to10(int A[])		//二进制数转换成十进制数
{	int i;
	long s=A[0],x=1;
	for (i=1;i<MAXN;i++)
	{	x=2*x;
		s+=A[i]*x;
	}
	return s;
}
void Trans10to2(int x,int A[])	//将十进数转换成二进制数
{	int i,j=0;
	while (x>0)
	{	A[j]=x%2;	j++;
		x=x/2;
	}
	for (i=j;i<MAXN;i++)
		A[i]=0;
}
void disp(int A[])		//从高位到低位输出二进制数A
{	int i;
	for (i=MAXN-1;i>=0;i--)
		printf("%d",A[i]);
	printf("\n");
}
void MULT(int X[],int Y[],int Z[],int n) //求Z=X*Y
{	int i;
	long e,e1,e2,e3,e4;
	int A[MAXN],B[MAXN],C[MAXN],D[MAXN];
	int m1[MAXN],m2[MAXN],m3[MAXN],m4[MAXN];
	for (i=0;i<MAXN;i++)	//Z初始化为0
		Z[i]=0;
	if (n==1)				//递归出口
	{	if (X[0]==1 && Y[0]==1)	Z[0]=1;
		else Z[0]=0;
	}
	else
	{	Left(X,A,n);		//A取X的左边n/2位
		Right(X,B,n);		//B取X的右边n/2位;
		Left(Y,C,n);		//C取Y的左边n/2位;
		Right(Y,D,n);		//D取Y的右边n/2位;
		MULT(A,C,m1,n/2);	//m1=AC
		MULT(A,D,m2,n/2);	//m2=AD
		MULT(B,C,m3,n/2);	//m3=BC
		MULT(B,D,m4,n/2);	//m4=DB
		e1=Trans2to10(m1);	//将m1转换成十进制数e1
		e2=Trans2to10(m2);	//将m2转换成十进制数e2
		e3=Trans2to10(m3);	//将m3转换成十进制数e3
		e4=Trans2to10(m4);	//将m4转换成十进制数e4
		e=e1*(int)pow(2,n)+(e2+e3)*(int)pow(2,n/2)+e4;
		Trans10to2(e,Z);	//将e转换成二进制数Z
	}
}
void trans(char a[],int n,int A[])	//将字符串a转换为整数数组A
{	int i;
	for (i=0;i<n;i++)
		A[i]=int(a[n-1-i]-'0');
	for (i=n;i<MAXN;i++)
		A[i]=0;
}
void main()
{	long e;
	char a[]="10101100";	//两个参与运算的二进制数
	char b[]="10010011";
	int X[MAXN],Y[MAXN],Z[MAXN];
	int n=8;
	trans(a,n,X);			//将a转换成整数数组X
	trans(b,n,Y);			//将b转换成整数数组Y
	printf("X:"); disp(X);	//输出X
	printf("Y:"); disp(Y);	//输出Y
	printf("Z=X*Y\n");
	MULT(X,Y,Z,n);		//求Z=X*Y
	printf("Z:"); disp(Z);	//输出Z
	e=Trans2to10(Z);		//将Z转换成十进制数e
	printf("Z对应的十进制数:%ld\n",e);
	printf("验证正确性:\n");
	long x,y,z;
	x=Trans2to10(X);		//将X转换成十进制数x
	y=Trans2to10(Y);		//将X转换成十进制数y
	printf("X对应的十进制数x:%ld\n",x);
	printf("Y对应的十进制数y:%ld\n",y);
	printf("z=x*y\n");
	z=x*y;				//求z=x*y
	printf("求解结果z:%d\n",z);
}
```

## 总结

思路：

>宏观划分（在这里不需要思考太多具体实现）
>
>递归出口（问题在什么地步可以轻而易举地解决）
>
>问题合并（大问题是怎样由小问题得到的）

这三大步分别从大问题 小问题 和大问题与小问题之间的联系 着手考虑，好美的思想，有点哲学惹…

