.class public Lcom/kakao/talk/theme/apeach/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.kt"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/kakao/talk/theme/apeach/MainActivity$Companion;
    }
.end annotation

.annotation runtime Lkotlin/Metadata;
    d1 = {
        "\u00008\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0002\n\u0002\u0018\u0002\n\u0002\u0008\u0003\n\u0002\u0018\u0002\n\u0002\u0008\u0002\u0008\u0016\u0018\u0000 \u00132\u00020\u0001:\u0001\u0013B\u0005\u00a2\u0006\u0002\u0010\u0002J\u0008\u0010\u0005\u001a\u00020\u0006H\u0002J\u0008\u0010\u0007\u001a\u00020\u0008H\u0016J\u0012\u0010\t\u001a\u00020\u00062\u0008\u0010\n\u001a\u0004\u0018\u00010\u000bH\u0014J\u0010\u0010\u000c\u001a\u00020\u00062\u0006\u0010\r\u001a\u00020\u000eH\u0002J\u0018\u0010\u000f\u001a\u00020\u00062\u0006\u0010\u0010\u001a\u00020\u000e2\u0006\u0010\u0011\u001a\u00020\u0012H\u0002R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082.\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0014"
    }
    d2 = {
        "Lcom/kakao/talk/theme/apeach/MainActivity;",
        "Landroid/app/Activity;",
        "()V",
        "binding",
        "Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;",
        "enableEdgeToEdge",
        "",
        "isKakaoTalkInstalled",
        "",
        "onCreate",
        "savedInstanceState",
        "Landroid/os/Bundle;",
        "setInsetListener",
        "rootView",
        "Landroid/view/View;",
        "setPaddingForInsets",
        "view",
        "insets",
        "Landroid/view/WindowInsets;",
        "Companion",
        "apeach-26.1.0-source_debug"
    }
    k = 0x1
    mv = {
        0x1,
        0x9,
        0x0
    }
    xi = 0x30
.end annotation


# static fields
.field public static final Companion:Lcom/kakao/talk/theme/apeach/MainActivity$Companion;

.field public static final KAKAOTALK_PACKAGE_NAME:Ljava/lang/String; = "com.kakao.talk"

.field private static final KAKAOTALK_SETTINGS_THEME_URI:Ljava/lang/String; = "kakaotalk://settings/theme/"

.field private static final MARKET_URI:Ljava/lang/String; = "market://details?id="


# instance fields
.field private binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;


# direct methods
.method public static synthetic $r8$lambda$EFwM8thAsIksxt7q7fHLcpNDryU(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V
    .locals 0

    invoke-static {p0, p1}, Lcom/kakao/talk/theme/apeach/MainActivity;->onCreate$lambda$0(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$aMaS33CHVufPyNBsgu2Pmv2l3a0(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;Landroid/view/WindowInsets;)Landroid/view/WindowInsets;
    .locals 0

    invoke-static {p0, p1, p2}, Lcom/kakao/talk/theme/apeach/MainActivity;->setInsetListener$lambda$2(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;Landroid/view/WindowInsets;)Landroid/view/WindowInsets;

    move-result-object p0

    return-object p0
.end method

.method public static synthetic $r8$lambda$wAFrRcU7ykWo4Xy3gu3Z1TL7UYg(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V
    .locals 0

    invoke-static {p0, p1}, Lcom/kakao/talk/theme/apeach/MainActivity;->onCreate$lambda$1(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V

    return-void
.end method

.method static constructor <clinit>()V
    .locals 2

    new-instance v0, Lcom/kakao/talk/theme/apeach/MainActivity$Companion;

    const/4 v1, 0x0

    invoke-direct {v0, v1}, Lcom/kakao/talk/theme/apeach/MainActivity$Companion;-><init>(Lkotlin/jvm/internal/DefaultConstructorMarker;)V

    sput-object v0, Lcom/kakao/talk/theme/apeach/MainActivity;->Companion:Lcom/kakao/talk/theme/apeach/MainActivity$Companion;

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    .line 12
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    return-void
.end method

.method private final enableEdgeToEdge()V
    .locals 2

    .line 49
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1e

    if-lt v0, v1, :cond_0

    .line 50
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/view/Window;->setDecorFitsSystemWindows(Z)V

    goto :goto_0

    .line 53
    :cond_0
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    invoke-virtual {v0}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v0

    .line 54
    nop

    .line 53
    const/16 v1, 0x300

    invoke-virtual {v0, v1}, Landroid/view/View;->setSystemUiVisibility(I)V

    .line 58
    :goto_0
    return-void
.end method

.method private static final onCreate$lambda$0(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V
    .locals 4
    .param p0, "this$0"    # Lcom/kakao/talk/theme/apeach/MainActivity;
    .param p1, "it"    # Landroid/view/View;

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullParameter(Ljava/lang/Object;Ljava/lang/String;)V

    .line 27
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.VIEW"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .line 28
    .local v0, "intent":Landroid/content/Intent;
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->getPackageName()Ljava/lang/String;

    move-result-object v1

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    const-string v3, "kakaotalk://settings/theme/"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-static {v1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;

    .line 29
    invoke-virtual {p0, v0}, Lcom/kakao/talk/theme/apeach/MainActivity;->startActivity(Landroid/content/Intent;)V

    .line 30
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->finish()V

    .line 31
    return-void
.end method

.method private static final onCreate$lambda$1(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;)V
    .locals 3
    .param p0, "this$0"    # Lcom/kakao/talk/theme/apeach/MainActivity;
    .param p1, "it"    # Landroid/view/View;

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullParameter(Ljava/lang/Object;Ljava/lang/String;)V

    .line 34
    new-instance v0, Landroid/content/Intent;

    const-string v1, "market://details?id=com.kakao.talk"

    invoke-static {v1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v1

    const-string v2, "android.intent.action.VIEW"

    invoke-direct {v0, v2, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;Landroid/net/Uri;)V

    .line 35
    .local v0, "intent":Landroid/content/Intent;
    invoke-virtual {p0, v0}, Lcom/kakao/talk/theme/apeach/MainActivity;->startActivity(Landroid/content/Intent;)V

    .line 36
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->finish()V

    .line 37
    return-void
.end method

.method private final setInsetListener(Landroid/view/View;)V
    .locals 1
    .param p1, "rootView"    # Landroid/view/View;

    .line 61
    new-instance v0, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda2;

    invoke-direct {v0, p0}, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda2;-><init>(Lcom/kakao/talk/theme/apeach/MainActivity;)V

    invoke-virtual {p1, v0}, Landroid/view/View;->setOnApplyWindowInsetsListener(Landroid/view/View$OnApplyWindowInsetsListener;)V

    .line 71
    return-void
.end method

.method private static final setInsetListener$lambda$2(Lcom/kakao/talk/theme/apeach/MainActivity;Landroid/view/View;Landroid/view/WindowInsets;)Landroid/view/WindowInsets;
    .locals 2
    .param p0, "this$0"    # Lcom/kakao/talk/theme/apeach/MainActivity;
    .param p1, "view"    # Landroid/view/View;
    .param p2, "insets"    # Landroid/view/WindowInsets;

    const-string v0, "this$0"

    invoke-static {p0, v0}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullParameter(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "view"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullParameter(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "insets"

    invoke-static {p2, v0}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullParameter(Ljava/lang/Object;Ljava/lang/String;)V

    .line 62
    invoke-direct {p0, p1, p2}, Lcom/kakao/talk/theme/apeach/MainActivity;->setPaddingForInsets(Landroid/view/View;Landroid/view/WindowInsets;)V

    .line 64
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1e

    if-lt v0, v1, :cond_0

    .line 65
    sget-object v0, Landroid/view/WindowInsets;->CONSUMED:Landroid/view/WindowInsets;

    goto :goto_0

    .line 68
    :cond_0
    invoke-virtual {p2}, Landroid/view/WindowInsets;->consumeSystemWindowInsets()Landroid/view/WindowInsets;

    move-result-object v0

    .line 64
    :goto_0
    return-object v0
.end method

.method private final setPaddingForInsets(Landroid/view/View;Landroid/view/WindowInsets;)V
    .locals 5
    .param p1, "view"    # Landroid/view/View;
    .param p2, "insets"    # Landroid/view/WindowInsets;

    .line 74
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1e

    if-lt v0, v1, :cond_0

    .line 76
    invoke-static {}, Landroid/view/WindowInsets$Type;->systemBars()I

    move-result v0

    invoke-virtual {p2, v0}, Landroid/view/WindowInsets;->getInsets(I)Landroid/graphics/Insets;

    move-result-object v0

    const-string v1, "getInsets(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullExpressionValue(Ljava/lang/Object;Ljava/lang/String;)V

    .line 77
    .local v0, "systemBars":Landroid/graphics/Insets;
    nop

    .line 78
    iget v1, v0, Landroid/graphics/Insets;->left:I

    .line 79
    iget v2, v0, Landroid/graphics/Insets;->top:I

    .line 80
    iget v3, v0, Landroid/graphics/Insets;->right:I

    .line 81
    iget v4, v0, Landroid/graphics/Insets;->bottom:I

    .line 77
    invoke-virtual {p1, v1, v2, v3, v4}, Landroid/view/View;->setPadding(IIII)V

    .end local v0    # "systemBars":Landroid/graphics/Insets;
    goto :goto_0

    .line 86
    :cond_0
    nop

    .line 87
    invoke-virtual {p2}, Landroid/view/WindowInsets;->getSystemWindowInsetLeft()I

    move-result v0

    .line 88
    invoke-virtual {p2}, Landroid/view/WindowInsets;->getSystemWindowInsetTop()I

    move-result v1

    .line 89
    invoke-virtual {p2}, Landroid/view/WindowInsets;->getSystemWindowInsetRight()I

    move-result v2

    .line 90
    invoke-virtual {p2}, Landroid/view/WindowInsets;->getSystemWindowInsetBottom()I

    move-result v3

    .line 86
    invoke-virtual {p1, v0, v1, v2, v3}, Landroid/view/View;->setPadding(IIII)V

    .line 93
    :goto_0
    return-void
.end method


# virtual methods
.method public isKakaoTalkInstalled()Z
    .locals 3

    .line 96
    nop

    .line 97
    const/4 v0, 0x0

    :try_start_0
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v1

    const-string v2, "com.kakao.talk"

    invoke-virtual {v1, v2, v0}, Landroid/content/pm/PackageManager;->getPackageInfo(Ljava/lang/String;I)Landroid/content/pm/PackageInfo;
    :try_end_0
    .catch Landroid/content/pm/PackageManager$NameNotFoundException; {:try_start_0 .. :try_end_0} :catch_0

    .line 98
    const/4 v0, 0x1

    goto :goto_0

    .line 99
    :catch_0
    move-exception v1

    .line 100
    .local v1, "e":Landroid/content/pm/PackageManager$NameNotFoundException;
    nop

    .line 96
    .end local v1    # "e":Landroid/content/pm/PackageManager$NameNotFoundException;
    :goto_0
    return v0
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 5
    .param p1, "savedInstanceState"    # Landroid/os/Bundle;

    .line 17
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    .line 19
    invoke-direct {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->enableEdgeToEdge()V

    .line 21
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->getLayoutInflater()Landroid/view/LayoutInflater;

    move-result-object v0

    invoke-static {v0}, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->inflate(Landroid/view/LayoutInflater;)Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    move-result-object v0

    const-string v1, "inflate(...)"

    invoke-static {v0, v1}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullExpressionValue(Ljava/lang/Object;Ljava/lang/String;)V

    iput-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    .line 22
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    const/4 v1, 0x0

    const-string v2, "binding"

    if-nez v0, :cond_0

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_0
    invoke-virtual {v0}, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->getRoot()Landroid/widget/RelativeLayout;

    move-result-object v0

    check-cast v0, Landroid/view/View;

    invoke-virtual {p0, v0}, Lcom/kakao/talk/theme/apeach/MainActivity;->setContentView(Landroid/view/View;)V

    .line 24
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_1

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_1
    invoke-virtual {v0}, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->getRoot()Landroid/widget/RelativeLayout;

    move-result-object v0

    const-string v3, "getRoot(...)"

    invoke-static {v0, v3}, Lkotlin/jvm/internal/Intrinsics;->checkNotNullExpressionValue(Ljava/lang/Object;Ljava/lang/String;)V

    check-cast v0, Landroid/view/View;

    invoke-direct {p0, v0}, Lcom/kakao/talk/theme/apeach/MainActivity;->setInsetListener(Landroid/view/View;)V

    .line 26
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_2

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_2
    iget-object v0, v0, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->apply:Landroid/widget/Button;

    new-instance v3, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda0;

    invoke-direct {v3, p0}, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda0;-><init>(Lcom/kakao/talk/theme/apeach/MainActivity;)V

    invoke-virtual {v0, v3}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    .line 33
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_3

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_3
    iget-object v0, v0, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->market:Landroid/widget/Button;

    new-instance v3, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda1;

    invoke-direct {v3, p0}, Lcom/kakao/talk/theme/apeach/MainActivity$$ExternalSyntheticLambda1;-><init>(Lcom/kakao/talk/theme/apeach/MainActivity;)V

    invoke-virtual {v0, v3}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    .line 39
    invoke-virtual {p0}, Lcom/kakao/talk/theme/apeach/MainActivity;->isKakaoTalkInstalled()Z

    move-result v0

    const/4 v3, 0x0

    const/16 v4, 0x8

    if-eqz v0, :cond_6

    .line 40
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_4

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_4
    iget-object v0, v0, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->apply:Landroid/widget/Button;

    invoke-virtual {v0, v3}, Landroid/widget/Button;->setVisibility(I)V

    .line 41
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_5

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    goto :goto_0

    :cond_5
    move-object v1, v0

    :goto_0
    iget-object v0, v1, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->market:Landroid/widget/Button;

    invoke-virtual {v0, v4}, Landroid/widget/Button;->setVisibility(I)V

    goto :goto_2

    .line 43
    :cond_6
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_7

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    move-object v0, v1

    :cond_7
    iget-object v0, v0, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->apply:Landroid/widget/Button;

    invoke-virtual {v0, v4}, Landroid/widget/Button;->setVisibility(I)V

    .line 44
    iget-object v0, p0, Lcom/kakao/talk/theme/apeach/MainActivity;->binding:Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;

    if-nez v0, :cond_8

    invoke-static {v2}, Lkotlin/jvm/internal/Intrinsics;->throwUninitializedPropertyAccessException(Ljava/lang/String;)V

    goto :goto_1

    :cond_8
    move-object v1, v0

    :goto_1
    iget-object v0, v1, Lcom/kakao/talk/theme/apeach/databinding/MainActivityBinding;->market:Landroid/widget/Button;

    invoke-virtual {v0, v3}, Landroid/widget/Button;->setVisibility(I)V

    .line 46
    :goto_2
    return-void
.end method
