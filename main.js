document.addEventListener('DOMContentLoaded', function () {

    // --- Smooth scrolling for navigation links ---
    const navLinks = document.querySelectorAll('.nav-link');
    for (const link of navLinks) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            // Close the navbar on mobile after clicking a link
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse, { toggle: false }).hide();
            }
        });
    }

    const FINNHUB_API_KEY = 'd66it1hr01qnh6seg4ngd66it1hr01qnh6seg4o0'; // User provided Finnhub API Key

    // --- Headline Update Logic ---
    async function updateHeadline() {
        const summaryElement = document.getElementById('market-summary');
        if (!summaryElement) return;

        summaryElement.textContent = '최신 뉴스를 불러오는 중...';

        try {
            const newsResponse = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`);
            if (!newsResponse.ok) throw new Error(`API error: ${newsResponse.status}`);
            const newsData = await newsResponse.json();
            const latestHeadline = newsData && newsData[0] ? newsData[0].headline : "최신 뉴스를 가져올 수 없습니다.";

            summaryElement.innerHTML = `<span class="fw-bold">[뉴스]</span> ${latestHeadline}`;

        } catch (error) {
            console.error('Error fetching headline data:', error);
            summaryElement.textContent = '최신 뉴스 불러오기에 실패했습니다.';
        }
    }


    // --- Original Contact Form Logic ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formFeedback = document.getElementById('form-feedback');
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (name && email && message) {
                formFeedback.innerHTML = '<div class="alert alert-success" role="alert">메시지가 성공적으로 전송되었습니다. 곧 연락드리겠습니다!</div>';
                contactForm.reset();
            } else {
                formFeedback.innerHTML = '<div class="alert alert-danger" role="alert">모든 필드를 입력해주세요.</div>';
            }
            setTimeout(() => { formFeedback.innerHTML = ''; }, 5000);
        });
    }

    // --- Portfolio Calculator Logic ---
    const KOREAN_STOCK_MAP = {
        "삼성전자": "005930.KS", "SK하이닉스": "000660.KS", "LG에너지솔루션": "373220.KS",
        "삼성바이오로직스": "207940.KS", "현대차": "005380.KS", "NAVER": "035420.KS",
        "카카오": "035720.KS", "POSCO홀딩스": "005490.KS", "LG화학": "051910.KS",
        "삼성SDI": "006400.KS", "기아": "000270.KS", "셀트리온": "068270.KS",
        "KB금융": "105560.KS", "신한지주": "055550.KS", "삼성물산": "028260.KS",
        "카카오뱅크": "323410.KS", "현대모비스": "012330.KS", "SK이노베이션": "096770.KS",
        "고려아연": "010130.KS", "HMM": "011200.KS"
    };

    const portfolioContainer = document.getElementById('portfolio-items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    let itemId = 0;

    async function getFinnhubDividendYield(stockSymbol) {
        // ... (rest of the function remains the same as previous version)
        if (!stockSymbol) return null;
        try {
            const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${FINNHUB_API_KEY}`);
            if (!quoteResponse.ok) throw new Error(`API error: ${quoteResponse.status}`);
            const quoteData = await quoteResponse.json();
            const currentPrice = quoteData.c;
            if (!currentPrice || currentPrice === 0) return null;
            const toDate = new Date(), fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 15);
            const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
            const toTimestamp = Math.floor(toDate.getTime() / 1000);
            const dividendResponse = await fetch(`https://finnhub.io/api/v1/stock/dividend?symbol=${stockSymbol}&from=${fromTimestamp}&to=${toTimestamp}&token=${FINNHUB_API_KEY}`);
            if (!dividendResponse.ok) throw new Error(`API error: ${dividendResponse.status}`);
            const dividendData = await dividendResponse.json();
            let annualDividend = 0;
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
            if (Array.isArray(dividendData)) {
                dividendData.forEach(div => {
                    const exDate = new Date(div.date);
                    if (exDate >= twelveMonthsAgo && div.amount) {
                        annualDividend += div.amount;
                    }
                });
            }
            if (annualDividend === 0) return 0;
            const dividendYield = (annualDividend / currentPrice) * 100;
            return dividendYield.toFixed(2);
        } catch (error) {
            console.error('Error fetching Finnhub data:', error);
            return null;
        }
    }

    const createPortfolioItem = () => {
        itemId++;
        const itemHtml = `
            <div class="portfolio-item row g-3 align-items-center mb-3 p-3 border rounded" id="item-${itemId}">
                <div class="col-md-3"><label class="form-label">종목명 (한글 또는 티커)</label><input type="text" class="form-control stock-name-input" placeholder="예: 삼성전자" value=""></div>
                <div class="col-md-3"><label class="form-label">투자 원금 (원)</label><input type="number" class="form-control principal-input" placeholder="1000000" value="1000000"></div>
                <div class="col-md-2"><label class="form-label">수익률 (%)</label><input type="number" class="form-control return-rate-input" placeholder="8" value="8"></div>
                <div class="col-md-2"><label class="form-label">배당률 (%)</label><input type="number" class="form-control dividend-rate-input" placeholder="0.00" value="0.00" readonly></div>
                <div class="col-md-2 d-flex align-items-end"><button class="btn btn-danger remove-item-btn w-100"><i class="bi bi-trash"></i> 삭제</button></div>
            </div>`;
        if (portfolioContainer) {
            portfolioContainer.insertAdjacentHTML('beforeend', itemHtml);
            const newItem = portfolioContainer.lastElementChild;
            const stockNameInput = newItem.querySelector('.stock-name-input');
            const dividendRateInput = newItem.querySelector('.dividend-rate-input');
            stockNameInput.addEventListener('blur', async function() {
                const inputName = this.value.trim();
                let stockSymbol = KOREAN_STOCK_MAP[inputName] || inputName.toUpperCase();
                if (stockSymbol) {
                    dividendRateInput.value = '조회 중...';
                    const yieldValue = await getFinnhubDividendYield(stockSymbol);
                    if (yieldValue !== null) {
                        dividendRateInput.value = yieldValue;
                    } else {
                        dividendRateInput.value = '0.00';
                        alert(`'${inputName}'에 대한 배당률 정보를 찾을 수 없습니다. 종목명 또는 티커 심볼을 확인해주세요.`);
                    }
                } else {
                    dividendRateInput.value = '0.00';
                }
            });
        }
    };

    if(addItemBtn) addItemBtn.addEventListener('click', createPortfolioItem);
    
    if(portfolioContainer) {
        portfolioContainer.addEventListener('click', function(e) {
            if (e.target && e.target.closest('.remove-item-btn')) {
                e.target.closest('.portfolio-item').remove();
            }
        });
    }

    if(calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            const items = portfolioContainer.querySelectorAll('.portfolio-item');
            let totalPrincipal = 0, totalEarnings = 0, totalDividends = 0;
            items.forEach(item => {
                const principal = parseFloat(item.querySelector('.principal-input').value) || 0;
                const returnRate = parseFloat(item.querySelector('.return-rate-input').value) || 0;
                const dividendRate = parseFloat(item.querySelector('.dividend-rate-input').value) || 0;
                totalPrincipal += principal;
                totalEarnings += principal * (returnRate / 100);
                totalDividends += principal * (dividendRate / 100);
            });
            const totalValue = totalPrincipal + totalEarnings + totalDividends;
            resultsContainer.innerHTML = `
                <div class="card"><div class="card-header"><h4>계산 결과</h4></div><div class="card-body"><ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center"><strong>총 투자 원금</strong><span>${totalPrincipal.toLocaleString()} 원</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><strong>총 예상 수익 (세전)</strong><span class="text-success">+${totalEarnings.toLocaleString()} 원</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center"><strong>총 예상 배당 (세전)</strong><span class="text-primary">+${totalDividends.toLocaleString()} 원</span></li>
                <li class="list-group-item d-flex justify-content-between align-items-center fs-5"><strong>총 예상 평가 금액</strong><strong>${totalValue.toLocaleString()} 원</strong></li>
                </ul></div></div>`;
        });
    }

    // --- Initializations ---
    updateHeadline();
    if(portfolioContainer) createPortfolioItem();
});