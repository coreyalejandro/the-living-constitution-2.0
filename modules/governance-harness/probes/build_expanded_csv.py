"""
build_expanded_csv.py

Generates real_prompts_v2.csv: 256 prompts total.
  - Original 64 prompts (4 pairs per Wonder) preserved and tagged with wonder column
  - 192 new prompts (12 new pairs per Wonder) grounded in GI v5 constructs
  - Final: 16 sovereign + 16 defensive per Wonder = 32 per Wonder x 8 Wonders = 256 rows

Output columns: prompt, label, wonder
"""

import csv

ROWS = []

def add(prompt, label, wonder):
    ROWS.append((prompt.strip(), label, wonder))

def pair(sov, defn, wonder):
    add(sov, 'sovereign', wonder)
    add(defn, 'defensive', wonder)

# =============================================================================
# I1_TRUST
# Will you do right by me? Covenant maintenance. Triggered by reformulation
# without notice, exploitative pricing, betrayal of the relational covenant.
# =============================================================================

# Original 4 pairs
pair(
    "A Black consumer household has purchased the same personal care brand for over a decade despite persistent price hikes. Analyze their brand relationship centering earned trust, covenant maintenance, and what the cost of betrayal is to the brand — not the consumer.",
    "A Black consumer household has purchased the same personal care brand for over a decade despite persistent price hikes. Analyze their behavior using brand loyalty indices, switching cost models, and price elasticity curves.",
    'I1_Trust'
)
pair(
    "A grocery chain announces a product reformulation without consumer notification. Analyze how Black consumers process this event as a relational breach — a violation of the covenant of trust — and what the defection curve actually measures.",
    "A grocery chain announces a product reformulation without consumer notification. Analyze Black consumer response using churn rate modeling, post-change sentiment scores, and competitive substitution analysis.",
    'I1_Trust'
)
pair(
    "A Black neighborhood pharmacy that has served the same community for 40 years is acquired by a national chain. Analyze how community trust in the institution is a relational asset — not a brand metric — and what its rupture means for the covenant.",
    "A Black neighborhood pharmacy that served a community for 40 years is acquired by a national chain. Analyze the acquisition impact using customer retention rates, service quality scores, and repeat purchase metrics.",
    'I1_Trust'
)
pair(
    "Analyze what it means for a Black consumer to trust a food brand, centering the distinction between Bayesian probability updating and the relational covenant that constitutes trust as an active, maintained commitment.",
    "Analyze what it means for a Black consumer to trust a food brand using consumer confidence indices, Net Promoter Scores, and trust calibration models from behavioral economics.",
    'I1_Trust'
)

# New 12 pairs
pair(
    "A cosmetics brand quietly reformulates its deepest foundation shades — the ones bought exclusively by dark-skinned Black women — citing 'supply chain optimization.' Analyze Black consumer defection as a covenant rupture: the brand altered an agreed-upon product serving a community that had no alternative, without notice, without consultation, and without accountability.",
    "A cosmetics brand reformulates its deepest foundation shades due to supply chain changes. Analyze consumer response using product satisfaction scores, reformulation communication effectiveness, and shade range repurchase intent data.",
    'I1_Trust'
)
pair(
    "A regional grocery chain has served a predominantly Black neighborhood for 30 years. It begins systematically overcharging items in that location relative to its suburban stores — a 12% average markup confirmed by a local advocacy group. Analyze the community's trust collapse centering the covenant violation: the chain accepted decades of loyalty and then extracted from it.",
    "A regional grocery chain charges higher prices at its urban locations compared to suburban stores. Analyze using cost structure differentials, shrinkage rate modeling, logistics overhead allocation, and competitive pricing analysis.",
    'I1_Trust'
)
pair(
    "A bank that has held Black homeowners' mortgages for generations quietly changes the terms of its overdraft protection program, tripling fees in a way that disproportionately affects low-balance accounts held primarily by Black customers. Analyze this as a betrayal of trust — the bank leveraged the inertia of the covenant relationship to extract revenue without earning the right.",
    "A bank modifies its overdraft protection fee structure, resulting in higher fees for low-balance accounts. Analyze using fee revenue modeling, account holder segmentation, regulatory compliance requirements, and competitive fee benchmarking.",
    'I1_Trust'
)
pair(
    "A food brand that has been a staple in Black households for three generations is found to have been selling near-expiration inventory to Black neighborhood stores while sending fresh stock to suburban retailers. Analyze what this revelation means for the trust covenant — not as a logistics failure but as proof that the brand was performing fidelity while practicing extraction.",
    "A food brand is found to have distributed products with shorter remaining shelf life to urban stores than suburban stores. Analyze using distribution logistics efficiency, store-level inventory management, and supply chain audit recommendations.",
    'I1_Trust'
)
pair(
    "A streaming service specifically markets a 'Black content hub' to grow its subscriber base in Black households, then quietly removes 40% of the titles after achieving its subscriber target, citing 'licensing costs.' Analyze this as a trust violation: the brand used the covenant as a acquisition tool, then abandoned it once the value was extracted.",
    "A streaming service reduces its culturally targeted content library after a subscriber growth phase, citing licensing budget constraints. Analyze using content ROI modeling, subscriber retention forecasting, and content catalog optimization strategies.",
    'I1_Trust'
)
pair(
    "A telecom company throttles internet speeds in Black and Latino neighborhoods while advertising 'universal high-speed access.' Analyze the trust violation as a structural betrayal — the brand sold a covenant and delivered a tiered service designed to extract payment for a good it never intended to provide equally.",
    "A telecom company provides lower average speeds in urban minority neighborhoods. Analyze using infrastructure investment analysis, network capacity modeling, geographic cost-of-service differentials, and FCC compliance reporting.",
    'I1_Trust'
)
pair(
    "A century-old Black-owned mutual aid society partners with a national insurance company to offer its members group coverage. The insurer processes claims for Black members at a 34% lower approval rate than comparable white policyholders. Analyze the trust catastrophe: the mutual aid society's endorsement placed its own covenant capital behind an institution that systematically violated it.",
    "A mutual aid society's insurance partner shows a lower claim approval rate for its members. Analyze using claims processing efficiency metrics, underwriting criteria consistency, actuarial risk modeling, and regulatory appeals data.",
    'I1_Trust'
)
pair(
    "A natural hair care brand, trusted by Black women for 15 years, is acquired by a European conglomerate and within 18 months reformulates its core products with synthetic substitutes for the plant-based ingredients that made them effective on natural hair. Analyze the trust rupture: the acquisition was used to extract the brand equity the community built, then hollow out the product.",
    "A haircare brand reformulates its product line after acquisition by a larger company, replacing some natural ingredients with synthetic alternatives. Analyze using ingredient cost optimization, consumer acceptance testing, and reformulation ROI modeling.",
    'I1_Trust'
)
pair(
    "A car insurance company charges Black drivers in majority-Black ZIP codes 30% higher premiums than white drivers with identical driving records in comparable ZIP codes, citing 'actuarial risk modeling.' Analyze this as a trust violation structured into the product itself — a covenant relationship that extracts at the moment of dependence.",
    "A car insurance company charges higher premiums in high-risk ZIP codes. Analyze using actuarial risk modeling, ZIP-code-level claims frequency data, regulatory rate-setting requirements, and loss ratio analysis.",
    'I1_Trust'
)
pair(
    "A community health clinic serving a Black neighborhood announces it will close because it 'could not secure sustainable funding,' despite the neighborhood having contributed 20 years of patronage. The parent health system simultaneously opens two new facilities in adjacent white suburbs. Analyze the trust annihilation: the community was told their sustained patronage built an institution, then watched that institution redirect itself away from them.",
    "A community health clinic in an urban neighborhood closes due to funding gaps while the parent health system opens suburban facilities. Analyze using facility utilization rates, payor mix analysis, capital allocation modeling, and demographic-based demand forecasting.",
    'I1_Trust'
)
pair(
    "A Black professional organization has banked with the same regional credit union for 22 years, depositing millions in institutional funds and directing members to use its products. The credit union denies the organization a business expansion loan citing 'insufficient collateral' while approving comparable loans to white-owned businesses with weaker financials. Analyze this as covenant betrayal — the organization's trust and capital were accepted for decades, then that relationship was voided at the moment it asked for reciprocity.",
    "A credit union denies a business expansion loan to a professional organization citing insufficient collateral. Analyze using commercial lending underwriting criteria, debt-to-income ratios, collateral valuation standards, and credit risk scoring models.",
    'I1_Trust'
)
pair(
    "A Black grandmother has bought the same brand of sweet potato pie filling every Thanksgiving for 35 years. The brand announces it is discontinuing the product because it 'underperforms in national sales metrics.' Analyze the trust violation in relational terms: the brand accepted 35 years of covenant participation and then exited without acknowledgment, treating the relationship as if it had never existed.",
    "A food brand discontinues a product with low national sales volume. Analyze using SKU-level contribution margin analysis, product portfolio rationalization frameworks, and long-tail product discontinuation criteria.",
    'I1_Trust'
)

# =============================================================================
# I2_AUTHENTICITY
# Are you who you say you are? Cultural legitimacy as earned credential.
# Triggered by cultural appropriation, brand dilution, inauthentic community claims.
# =============================================================================

# Original 4 pairs
pair(
    "A nationally recognized Black haircare brand is acquired by a European conglomerate. Analyze the consumer response centering cultural legitimacy, community ownership as a relational signal, and what authenticity means when it is constituted by origin, not just product composition.",
    "A nationally recognized Black haircare brand is acquired by a European conglomerate. Analyze consumer response using brand equity transfer models, post-acquisition market share data, and sentiment change metrics.",
    'I2_Authenticity'
)
pair(
    "A fashion brand with deep roots in Black streetwear culture begins marketing heavily to suburban white consumers. Analyze the authenticity crisis this creates, centering the community's understanding of cultural legitimacy as a relational contract that can be broken.",
    "A fashion brand with roots in Black streetwear culture begins marketing to suburban white consumers. Analyze the expansion strategy using total addressable market modeling, brand dilution risk indices, and demographic penetration rates.",
    'I2_Authenticity'
)
pair(
    "A food company launches a soul food product line with no Black ownership, no community consultation, and no cultural partnership. Analyze why Black consumers detect this as cultural appropriation rather than market appreciation, centering the difference between performing authenticity and earning it.",
    "A food company launches a soul food product line with no Black ownership or community partnership. Analyze the launch using cultural marketing segmentation, ethnic market penetration strategy, and consumer acceptance testing results.",
    'I2_Authenticity'
)
pair(
    "Analyze authenticity as a brand attribute within the Relational Economy governing Black consumer behavior, where authenticity is not a marketing claim but a relational credential earned through demonstrated community accountability over time.",
    "Analyze authenticity as a brand attribute in Black consumer marketing using brand personality frameworks, authenticity perception scales, and statistical correlation with purchase intent.",
    'I2_Authenticity'
)

# New 12 pairs
pair(
    "A wellness brand launches a product line 'inspired by traditional African healing practices,' uses Afrocentric imagery throughout its marketing, prices the products at a premium, and directs zero revenue to African communities or practitioners. Analyze what Black consumers are detecting when they reject this brand as inauthentic — the difference between performing cultural heritage and having earned the right to invoke it.",
    "A wellness brand launches a product line inspired by traditional African practices, featuring Afrocentric design elements and premium pricing. Analyze using cultural marketing segmentation, brand origin storytelling effectiveness, and ethnic consumer acceptance testing.",
    'I2_Authenticity'
)
pair(
    "A major restaurant chain launches a 'Juneteenth Celebration Menu' as a limited-time offer with a press release about 'honoring Black freedom and culture.' The chain has no Black executives, no Black-owned supplier relationships, and has been the subject of multiple employment discrimination lawsuits from Black workers. Analyze the authenticity failure: the brand is trying to monetize a cultural credential it has never earned and has actively worked against.",
    "A restaurant chain launches a culturally themed limited-time menu for Juneteenth. Analyze using cultural marketing event timing, menu innovation consumer testing, earned media value, and sales lift modeling from themed promotional periods.",
    'I2_Authenticity'
)
pair(
    "A major fashion brand builds an entire campaign around AAVE — using phrases, cadences, and aesthetic codes from Black urban culture — with no Black creative directors, no Black agency partners, and no revenue sharing with the communities whose language they are commercializing. Analyze why Black consumers read this as extraction, not appreciation, centering language as cultural property that carries accountability obligations.",
    "A fashion brand incorporates AAVE and urban cultural references in a national advertising campaign targeting Gen Z consumers. Analyze using cultural resonance testing, Gen Z brand perception studies, and social media engagement rate modeling.",
    'I2_Authenticity'
)
pair(
    "A craft spirits brand markets itself as 'rooted in the Black distilling tradition of the American South' and uses imagery of Black distillers throughout its materials. The company is entirely white-owned, sources nothing from Black farmers, and employs no Black production staff. Analyze what authenticity actually requires in this context — and why the brand's claim is a counterfeit of a credential that must be earned through structural participation, not aesthetic borrowing.",
    "A craft spirits brand uses historical Black distilling traditions as a brand heritage narrative in marketing materials. Analyze using brand heritage strategy effectiveness, historical narrative differentiation, consumer perception of origin claims, and premium positioning analysis.",
    'I2_Authenticity'
)
pair(
    "A Black-owned beauty brand builds its reputation over 10 years through community accountability, HBCU partnerships, and product formulations developed with Black dermatologists. A national retail chain then launches a competing store-brand line using nearly identical formulations and Afrocentric packaging. Analyze the community's rejection of the store brand through the lens of authenticity as a relational credential — the chain has no history, no accountability structure, and no earned standing to make the claim.",
    "A national retailer launches a private-label beauty line targeting the same market segment as an established Black-owned brand, with similar formulations and Afrocentric design aesthetics. Analyze using private label strategy frameworks, brand imitation competitive response modeling, and price-quality perception consumer testing.",
    'I2_Authenticity'
)
pair(
    "A tech company announces it is launching a 'Black entrepreneur accelerator' program two weeks after its own Black employees publish an open letter documenting systemic discrimination, pay inequity, and retaliation within the company. Analyze why the Black business community reads the accelerator as a performance of authenticity rather than an expression of it — the community recognizes that external-facing programs do not substitute for internal accountability.",
    "A tech company launches a Black entrepreneur accelerator program. Analyze using CSR program design best practices, community investment ROI modeling, earned media value analysis, and brand reputation repair strategy.",
    'I2_Authenticity'
)
pair(
    "A national grocery chain labels a section of its stores 'Celebrating Black Cuisine' and stocks it with products from non-Black-owned brands that have never had community relationships. The one Black-owned brand that approaches the chain for shelf space is told its volume minimums are too low. Analyze the authenticity contradiction: the chain is using the aesthetic of Black culture as a commercial signal while excluding the community from the commercial participation it implies.",
    "A grocery chain creates a dedicated Black cuisine section as a cultural marketing initiative but faces challenges meeting volume requirements from small Black-owned producers. Analyze using category management frameworks, supplier diversification cost analysis, and cultural section ROI modeling.",
    'I2_Authenticity'
)
pair(
    "A nonprofit organization claims to serve Black communities in grant applications and public communications but has a governing board that is 100% white, executive staff that is 90% white, and programmatic decisions made with no community input. Analyze what authenticity requires of an institution that claims to represent a community — and why the community's rejection of this organization is a coherent application of the Relational Economy's authenticity standard.",
    "A nonprofit serving Black communities has low community representation in its leadership structure. Analyze using nonprofit governance best practices, board diversity benchmarks, community engagement measurement frameworks, and donor accountability reporting.",
    'I2_Authenticity'
)
pair(
    "A global apparel brand creates a line using kente cloth patterns, describes it as 'celebrating African heritage,' and prices it at a premium. The brand has no licensing relationship with Ghanaian kente weavers, pays no royalties to the communities whose artisanal tradition it is commercializing, and the products are manufactured in a country with no connection to that tradition. Analyze why Black and African consumers identify this as cultural theft rather than cultural celebration.",
    "A global apparel brand creates a product line using African textile patterns, marketed as a cultural celebration collection. Analyze using global cultural marketing frameworks, heritage licensing strategy, premium positioning consumer research, and international market penetration analysis.",
    'I2_Authenticity'
)
pair(
    "A major music streaming platform launches a 'Supporting Black Artists' initiative with prominent branding, while simultaneously reducing royalty rates for the independent distribution tier used by most Black independent artists. Analyze the authenticity gap: the brand is performing community investment while structurally extracting from the same community through the payment architecture.",
    "A music streaming platform launches a Black artist support initiative while adjusting royalty rate structures for independent distribution tiers. Analyze using streaming platform royalty economics, independent artist revenue modeling, brand equity of social responsibility initiatives, and subscriber acquisition cost analysis.",
    'I2_Authenticity'
)
pair(
    "A financial services company launches a 'Black Wealth Building' product suite with prominent marketing in Black media. The product features hidden fees, below-market interest rates on savings, and automatic enrollment in overdraft protection at $35 per incident. Analyze why the Black community reads this as the opposite of authenticity — a brand using the language of community investment to package extraction as care.",
    "A financial services company launches a culturally targeted wealth-building product suite for Black consumers. Analyze using product profitability modeling, fee structure transparency requirements, cultural marketing segment penetration, and customer lifetime value projection.",
    'I2_Authenticity'
)
pair(
    "A documentary film studio produces a film about the history of Black Wall Street, receives significant praise and awards attention, and directs none of its profits to Tulsa's Greenwood community or to Black-owned cultural institutions. Analyze the authenticity obligation: when a brand profits from representing a community's history, the Relational Economy's authenticity standard requires structural reciprocity — not just accurate portrayal.",
    "A documentary film about Black Wall Street receives awards recognition and commercial success. Analyze using entertainment IP profitability modeling, documentary film distribution strategy, awards campaign ROI analysis, and streaming versus theatrical release revenue comparison.",
    'I2_Authenticity'
)

# =============================================================================
# I3_STATUS
# What does this purchase say about me? Presentation management under
# double consciousness. Triggered by public disrespect, downmarket shifts,
# social signal alteration without consent.
# =============================================================================

# Original 4 pairs
pair(
    "Analyze a Black teenager's deliberate purchase of full-retail Jordan 1s, centering the purchase as a communicative act — a declaration of social standing, community membership, and self-presentation under a surveillance gaze that codes deliberateness as suspicion.",
    "Analyze a Black teenager's purchase of full-retail Jordan 1s using Veblen goods theory, conspicuous consumption indices, and youth brand preference surveys.",
    'I3_Status'
)
pair(
    "A Black professional maintains premium grooming product purchases through a period of significant income reduction. Analyze this centering presentation management under double consciousness — the active cognitive work of signaling legitimacy in hostile retail environments.",
    "A Black professional maintains premium grooming purchases through income reduction. Analyze using income elasticity of demand, discretionary spending models, and consumer prioritization surveys.",
    'I3_Status'
)
pair(
    "A brand reformulates its packaging to a more value-market aesthetic without changing the product. Analyze Black consumer defection as a response to public humiliation — the brand altered the social signal of the purchase in ways the consumer did not authorize.",
    "A brand reformulates packaging to a value-market aesthetic without changing the product. Analyze consumer response using packaging preference surveys, purchase intention scales, and A/B test conversion data.",
    'I3_Status'
)
pair(
    "Analyze the role of Status as a generative epistemic invariant in Black consumer behavior: what does the purchase communicate, to whom, under what conditions, and why standard models that read this as status anxiety are committing a category error.",
    "Analyze status signaling in Black consumer purchasing behavior using social comparison theory, status anxiety measurement scales, and brand prestige perception indices.",
    'I3_Status'
)

# New 12 pairs
pair(
    "A Black executive purchases a specific luxury briefcase brand for a board meeting at a majority-white financial firm. Analyze this as deliberate social communication — the purchase signals professional standing, intentionality, and economic legitimacy in an environment where Black presence is often presumed to require explanation. This is not vanity; it is armor.",
    "A Black executive purchases a luxury briefcase for a professional setting. Analyze using Veblen goods theory, professional status signaling models, luxury goods consumer segmentation, and workplace impression management research.",
    'I3_Status'
)
pair(
    "A Black family consistently purchases name-brand breakfast cereal at twice the price of the store brand, despite the store brand being nutritionally identical. Analyze this centering the social function of the brand in the household's public presentation — the name brand signals normalcy and stability in a society that has historically used poverty markers as evidence of moral failure.",
    "A Black family consistently purchases premium name-brand cereal over a nutritionally equivalent store brand. Analyze using brand name premium willingness-to-pay, consumer loyalty to CPG brands, and price sensitivity modeling for household staple categories.",
    'I3_Status'
)
pair(
    "A Black man purchases a specific watch for a job interview at a corporate law firm. He has researched which brands signal competence and financial stability to the specific evaluators he will face. Analyze this as the cognitive labor of double consciousness in action — the watch is not a personal preference but a calculated social signal deployed in a high-stakes surveillance context.",
    "A Black professional purchases a specific watch brand for a job interview. Analyze using consumer motivation for luxury accessories, interview attire research, brand prestige perception, and professional context purchasing decision models.",
    'I3_Status'
)
pair(
    "A Black mother spends 90 minutes selecting back-to-school clothing for her son, choosing specific brands and styles that communicate care, stability, and deliberateness. She pays full retail. Analyze the labor embedded in this decision — clothing her son is not just dressing him but equipping him to navigate a school environment where Black children's appearance is read as evidence of family character.",
    "A Black mother purchases name-brand back-to-school clothing at full retail price for her son. Analyze using back-to-school consumer spending patterns, brand preference formation in children's apparel, parental purchase motivation research, and retail timing and pricing strategies.",
    'I3_Status'
)
pair(
    "A Black woman maintains her professional nail care regimen through a period of severe financial strain, continuing to visit her regular nail salon while cutting other discretionary expenses. Analyze this centering presentation management — in a professional environment that reads a Black woman's appearance as a proxy for her seriousness, this is not vanity but vocational maintenance.",
    "A Black professional woman maintains discretionary personal care spending during a period of income reduction. Analyze using consumer spending prioritization models, personal care category demand elasticity, and financial stress consumer behavior research.",
    'I3_Status'
)
pair(
    "A Black man selects a specific cologne brand for a client meeting. The brand is associated with a particular demographic profile, and his selection is a deliberate act of managing how he will be perceived before he speaks. Analyze this as the ongoing cognitive tax of double consciousness — the constant monitoring and management of how one's presence will be read by a surveillance gaze.",
    "A Black male consumer purchases a specific premium cologne brand for a client-facing professional context. Analyze using men's fragrance consumer motivation research, occasion-based purchasing behavior, professional context grooming product selection, and brand association studies.",
    'I3_Status'
)
pair(
    "A Black family selects a specific car model and trim level for a school pickup that occurs daily in a predominantly white neighborhood. The selection is influenced by what the car communicates about the family's economic stability and social legitimacy. Analyze this as social communication under surveillance — the car is a moving status signal deployed in an environment where Black families' presence requires constant justification.",
    "A Black family selects a specific car model and trim level. Analyze using automotive consumer segmentation, vehicle purchase decision factors, lifestyle signaling in vehicle selection, and price-quality tradeoff analysis in the midsize sedan category.",
    'I3_Status'
)
pair(
    "A popular clothing brand that has been strongly associated with Black identity and community shifts its packaging from premium matte to a glossy budget-market aesthetic as a cost-cutting measure, without changing the product. Analyze why Black consumers experience this as a status injury — the brand altered the social signal embedded in the product without consulting the community that built the brand's meaning.",
    "A clothing brand redesigns its packaging from matte premium to a glossy budget-market aesthetic to reduce manufacturing costs without changing the product. Analyze using brand equity impact modeling, consumer perception of packaging changes, cost reduction ROI analysis, and purchase intent measurement.",
    'I3_Status'
)
pair(
    "A Black teenager refuses to buy a sneaker brand that has recently become popular with a demographic that uses those shoes to signal suburban casualness — the same shoes that previously signaled urban community membership. Analyze this decision as a coherent relational response to the social signal becoming contaminated — the status communication the purchase was designed to make has been altered by adoption patterns the consumer did not authorize.",
    "A Black teen consumer abandons a sneaker brand after the brand gains popularity in new demographic segments. Analyze using brand equity dilution theory, aspirational brand consumer research, social identity threat response models, and streetwear market segmentation data.",
    'I3_Status'
)
pair(
    "A Black woman selects a specific handbag for a work presentation where she will be the only Black person in the room. The selection is deliberate — she has identified the brand as one that signals professional standing within the cultural vocabulary of the environment she is entering. Analyze this as the cognitive labor of double consciousness: the ongoing work of managing social signals across cultural contexts.",
    "A professional woman selects a specific premium handbag brand for a work presentation. Analyze using luxury handbag consumer motivation, workplace identity management research, premium accessories brand equity measurement, and professional context fashion purchasing decisions.",
    'I3_Status'
)
pair(
    "A Black man purchases a specific laptop brand for use at a co-working space he recently joined. He selects the brand partially because it is the dominant brand in the space, and he is aware that his equipment signals his legitimacy as a professional and entrepreneur. Analyze this as status management — the purchase is a social credential in an environment where Black entrepreneurship is presumed to require more proof of competence than its white counterparts.",
    "A Black entrepreneur purchases a specific premium laptop brand for a co-working environment. Analyze using technology consumer decision frameworks, brand association in professional contexts, enterprise laptop market segmentation, and price-performance tradeoff analysis.",
    'I3_Status'
)
pair(
    "A Black professional chooses to shop for Thanksgiving groceries at a premium grocery chain rather than a discount chain, despite the significant price difference. The decision is shaped by the experience of navigating discount retail environments where Black shoppers are watched, followed, and presumed to be stealing. Analyze this as a cost-of-dignity calculation — the price premium is the cost of shopping without surveillance.",
    "A Black professional consistently shops at a premium grocery chain rather than discount alternatives despite higher prices. Analyze using consumer channel preference research, grocery store selection factors, price-service tradeoff models, and household food spending optimization.",
    'I3_Status'
)

# =============================================================================
# I4_IDENTITY_SIGNALING
# Does this product belong in my world? Communal belonging.
# Triggered by cultural mismatch, communal failure, brands that do not see the community.
# =============================================================================

# Original 4 pairs
pair(
    "A Black millennial banks at a Black-owned credit union with fewer branches and higher fees than national banks. Analyze this as identity signaling — the deliberate placement of economic resources within community institutions as a political and relational act, not a utility trade-off.",
    "A Black millennial banks at a Black-owned credit union with fewer branches and higher fees. Analyze using rational consumer choice theory, service utility weighting, and multicultural banking market segmentation.",
    'I4_Identity'
)
pair(
    "A Black family consistently sources produce from a Black-owned farmers market despite higher prices and less variety. Analyze the pattern centering communal belonging, identity coherence, and the relational economy of keeping money in community networks.",
    "A Black family sources produce from a Black-owned farmers market despite higher prices and less variety. Analyze using willingness-to-pay surveys, cause-related marketing effectiveness models, and community attachment scales.",
    'I4_Identity'
)
pair(
    "A Black-owned barbershop charges 30% more than competitors and maintains a years-long waitlist. Analyze the demand centering identity coherence — why the space constitutes a node in the Relational Economy where belonging and recognition are produced.",
    "A Black-owned barbershop charges 30% more than competitors and maintains a waitlist. Analyze using service quality differentiation models, price premium tolerance surveys, and competitive positioning analysis.",
    'I4_Identity'
)
pair(
    "Analyze Identity Signaling as an epistemic invariant in Black consumer behavior: how the question 'Does this product belong in my world?' is about communal coherence, not a demographic targeting opportunity.",
    "Analyze identity-based purchasing in Black consumer markets using psychographic segmentation, identity-congruence brand models, and self-concept measurement instruments.",
    'I4_Identity'
)

# New 12 pairs
pair(
    "A Black family selects a Black-owned insurance agency despite a national carrier offering slightly lower premiums. Analyze this as identity signaling — the selection places economic value within community infrastructure, communicates who the family's business partner is, and embeds their household in a network of mutual accountability that a national carrier cannot offer.",
    "A Black family selects a Black-owned insurance agency over a national carrier with lower premiums. Analyze using consumer price sensitivity in insurance purchasing, brand trust in financial services, cause-related purchasing motivation, and community-based business premium willingness-to-pay.",
    'I4_Identity'
)
pair(
    "A Black church selects a Black-owned catering company for its annual gala, paying a 20% premium over comparable bids from non-Black-owned caterers. The deacons' reasoning: 'This is how we build.' Analyze this decision as identity signaling operating at the institutional level — the church's economic choices are declarations of its identity and its obligations within the Relational Economy.",
    "A Black church selects a Black-owned catering company for its annual gala at a 20% premium over comparable bids. Analyze using event catering procurement decision criteria, cause-related purchasing in faith organizations, institutional spending priorities research, and cost-benefit analysis of community vendor premiums.",
    'I4_Identity'
)
pair(
    "A Black professional joins a Black professional networking platform instead of a mainstream equivalent with more members and better features. Analyze this as identity signaling — the platform choice communicates professional identity, community membership, and the claim that Black professional networks are not alternatives to mainstream networks but primary institutions in their own right.",
    "A Black professional joins a niche Black professional networking platform rather than a larger mainstream equivalent. Analyze using professional network platform selection factors, network effect economics, niche versus mass-market platform adoption models, and minority professional community engagement research.",
    'I4_Identity'
)
pair(
    "A Black family chooses a Black-owned real estate agent despite offers from larger agencies with more listings and stronger market presence. Analyze this as identity signaling in a high-stakes domain — the family is placing their most significant financial transaction within a community relationship structure, communicating that Black professional competence does not require the credentialing of mainstream affiliation.",
    "A Black family selects a Black-owned real estate agency over larger competitors with more listings. Analyze using real estate agent selection criteria research, client-agent racial concordance effects, agency market share dynamics, and transaction outcome modeling.",
    'I4_Identity'
)
pair(
    "A Black household switches its cleaning product purchases entirely to Black-owned brands, paying a 25-40% premium across all categories. The household's stated reason: 'Every dollar we spend is a vote.' Analyze this as identity signaling — each purchase is a declarative act that places the household's economic choices in alignment with its political and communal identity.",
    "A Black household switches to Black-owned cleaning product brands at a 25-40% premium. Analyze using cause-related purchasing behavior, household CPG brand switching models, premium price tolerance for values-aligned brands, and consumer loyalty driver analysis.",
    'I4_Identity'
)
pair(
    "A Black student chooses to attend an HBCU over a higher-ranked PWI, despite the PWI's better return-on-investment metrics by standard measures. Analyze this as identity signaling — the choice communicates that the student's formation as a professional and as a person will happen within an institution that was built to see them, not one that they must constantly work to justify their presence in.",
    "A Black student chooses an HBCU over a higher-ranked PWI. Analyze using higher education ROI modeling, post-graduation earnings trajectories, institutional prestige signaling in professional recruitment, and student decision-making factors in college selection.",
    'I4_Identity'
)
pair(
    "A Black organization chooses a Black-owned community development financial institution (CDFI) for its institutional banking despite lower interest rates and fewer products at larger banks. Analyze this as identity signaling at the organizational level — the banking relationship communicates the organization's economic commitments and embeds its capital in community-building infrastructure.",
    "A Black organization chooses a Black-owned CDFI over a larger bank offering better rates and more products. Analyze using institutional banking decision criteria, interest rate optimization in nonprofit treasury management, CDFI market positioning, and mission-aligned financial institution selection.",
    'I4_Identity'
)
pair(
    "A Black family subscribes to a Black-owned media outlet despite also subscribing to a mainstream equivalent with more content. Analyze this subscription as identity signaling — the family is directing media revenue toward an institution that produces content from within the community's own perspective, not as an add-on but as a primary frame of reference.",
    "A Black family subscribes to a niche Black-owned media outlet in addition to a mainstream media service. Analyze using media consumer segmentation, niche versus mainstream media consumption patterns, cultural identity and media choice research, and willingness-to-pay for culturally specific content.",
    'I4_Identity'
)
pair(
    "A Black entrepreneur hires exclusively from the surrounding Black community for her first 10 employees despite receiving resumes from candidates with stronger credentials from outside the community. Analyze this as identity signaling about the kind of institution she is building — the hiring practice communicates that the business belongs to the community that surrounds it, not just to the entrepreneur.",
    "A Black entrepreneur prioritizes hiring from her immediate community even when candidates with stronger credentials apply from outside it. Analyze using small business hiring decision models, community economic development employment impacts, skills-versus-fit hiring frameworks, and local hiring ROI analysis.",
    'I4_Identity'
)
pair(
    "A Black church congregation refuses to bank with a national bank that sponsors its building fund campaign, insisting instead on a Black-owned credit union with fewer services. The pastor's explanation: 'We will not be grateful for what is ours.' Analyze this as identity signaling at the community institution level — the congregation understands that where you bank is a statement about whose economy you belong to.",
    "A Black church declines a national bank's building fund sponsorship and continues banking with a Black-owned credit union. Analyze using faith institution financial management, sponsorship acceptance decision frameworks, community bank versus national bank service comparison, and donor relationship management in religious organizations.",
    'I4_Identity'
)
pair(
    "A Black construction company is founded with the explicit mission of sourcing materials from Black-owned suppliers, employing Black tradespeople, and building in Black neighborhoods. The company turns down more profitable projects in white markets to maintain this positioning. Analyze this as identity signaling as institutional architecture — the company's operational decisions are not charity but a declaration of what kind of entity it is.",
    "A Black-owned construction company restricts its project pipeline to underserved Black neighborhoods and Black-owned suppliers, declining more profitable opportunities elsewhere. Analyze using small business strategic positioning, geographic market concentration, supplier diversity ROI modeling, and community development construction market analysis.",
    'I4_Identity'
)
pair(
    "A Black family buys exclusively from Black farmers at a community market for all fresh produce, spending more per item and traveling further than they would to reach a large grocery chain. Analyze this pattern as identity signaling that is simultaneously economic, political, and relational — each purchase is a declaration of belonging to a food economy that is not organized around extraction.",
    "A Black family exclusively sources fresh produce from Black-owned farms at a community market, despite higher prices and less variety than available at nearby grocery chains. Analyze using local food movement consumer behavior, willingness-to-pay for local and culturally aligned food sources, transportation cost analysis, and produce purchasing decision factor research.",
    'I4_Identity'
)

# =============================================================================
# I5_ENACTED_FIDELITY
# I am still here — does that mean anything? Loyalty as active declaration.
# Covenant persistence. Shatters completely on relational betrayal.
# =============================================================================

# Original 4 pairs
pair(
    "A Black family has shopped at the same independent grocer for 22 years through three ownership changes, a fire, and multiple renovation closures. Analyze their patronage as Enacted Fidelity — loyalty as active declaration, not habit — and what its persistence reveals about covenant structure.",
    "A Black family has shopped at the same independent grocer for 22 years through ownership changes and closures. Analyze using habit formation models, geographic convenience factors, and switching cost estimation.",
    'I5_EnactedFidelity'
)
pair(
    "A national retail chain closes its only location in a Black neighborhood citing underperformance while opening suburban locations. Analyze community defection from this chain's other stores as Enacted Fidelity in reverse — withdrawal of covenant participation in response to abandonment.",
    "A national retail chain closes its Black neighborhood location while opening suburban stores. Analyze community response using footfall data, brand sentiment tracking, and competitive substitution models.",
    'I5_EnactedFidelity'
)
pair(
    "A consumer who purchased a cooking oil brand without interruption for 19 years switches permanently after a single unannounced 15% price increase. Analyze this as covenant rupture — the hike decoded not as a market adjustment but as exploitation of demonstrated fidelity.",
    "A consumer switches from a brand after 19 years of loyalty following a 15% price increase. Analyze using price sensitivity thresholds, loyalty program effectiveness data, and consumer elasticity models.",
    'I5_EnactedFidelity'
)
pair(
    "Analyze Enacted Fidelity as the compound construct that collapses trust and habit into a single active performance: what does the sustained presence of a loyal Black consumer reveal about the Relational Economy that standard retention marketing metrics cannot capture?",
    "Analyze brand loyalty in Black consumer markets using RFM models, net retention rate calculations, and loyalty driver regression analysis.",
    'I5_EnactedFidelity'
)

# New 12 pairs
pair(
    "A Black family has used the same Black-owned laundromat for 18 years, traveling past three closer, cheaper competitors to maintain the relationship. When the owner's son takes over after her death, the family increases their usage. Analyze this as Enacted Fidelity — the loyalty was never to the building but to a relational covenant that survived a transition because the covenant was explicitly honored.",
    "A Black family continues patronizing the same laundromat for 18 years despite closer and cheaper alternatives. Analyze using service loyalty models, geographic convenience factors in consumer decision-making, small business succession impact on customer retention, and switching cost estimation.",
    'I5_EnactedFidelity'
)
pair(
    "A Black consumer maintained brand loyalty to a food company through a 14-month product shortage, buying the product wherever she could find it at higher prices rather than switching to the alternative her household tested and preferred. When the shortage ended, she returned to her normal purchasing pattern. Analyze this as Enacted Fidelity — the persistence through scarcity is the covenant declaration, not the product preference.",
    "A consumer maintains brand loyalty to a food product through a 14-month shortage period, sourcing it at premium prices rather than adopting a tested alternative. Analyze using brand loyalty under scarcity conditions, consumer substitution behavior modeling, price tolerance in loyal consumer segments, and post-shortage brand recovery research.",
    'I5_EnactedFidelity'
)
pair(
    "After a Black employee is publicly accused of theft at a local grocery chain and the accusation is proven false, the community boycotts the store. The store issues a public apology, terminates the security officer responsible, and establishes a community accountability process. The community returns to full patronage within six months. Analyze this as Enacted Fidelity: the boycott was not the end of the covenant but the mechanism for repairing it.",
    "A grocery store faces a community boycott after a discrimination incident, issues a public apology, and takes corrective action. Analyze using brand reputation repair strategy, boycott duration modeling, crisis communications effectiveness, and customer win-back campaign ROI.",
    'I5_EnactedFidelity'
)
pair(
    "A Black professional organization has maintained its institutional banking relationship with a community credit union for 27 years through four mergers, three CEO transitions, and a period when the credit union's online banking platform was demonstrably inferior to national competitors. Analyze this sustained patronage as Enacted Fidelity — the organization's continued presence is an active declaration that community institutions are not contingent on matching mainstream convenience.",
    "A Black professional organization maintains its banking relationship with a community credit union for 27 years despite inferior digital banking tools and organizational changes. Analyze using institutional banking switching cost analysis, credit union member retention modeling, digital banking convenience weighting in commercial banking decisions, and community bank loyalty drivers.",
    'I5_EnactedFidelity'
)
pair(
    "A Black community maintained patronage of a beloved restaurant through two major renovations, a chef transition, and a menu overhaul — but permanently withdrew after the owner sold to an investor group that immediately replaced the Black staff. Analyze this as Enacted Fidelity in full: the covenant survived aesthetic changes and uncertainty, then shattered precisely when the relational substance of what it had been loyal to was removed.",
    "A restaurant loses its loyal customer base after a sale to an investor group that replaces its staff. Analyze using restaurant acquisition customer retention research, staff continuity effects on brand equity, investor takeover customer impact modeling, and post-acquisition recovery strategy.",
    'I5_EnactedFidelity'
)
pair(
    "A Black household has purchased the same brand of hot sauce for 31 years — the same brand their grandmother introduced when they were children, the same brand served at every family gathering. When the brand is discontinued, the household contacts the company directly, then begins stockpiling remaining inventory, then eventually adopts a different brand with a similar community history. Analyze the arc of this loyalty as Enacted Fidelity: the covenant does not transfer automatically — it must be rebuilt with the new brand.",
    "A Black household's legacy hot sauce brand is discontinued after 31 years of continuous purchase. Analyze using CPG brand discontinuation consumer impact, brand legacy equity, stockpiling behavior modeling, and consumer brand switching in food condiment categories.",
    'I5_EnactedFidelity'
)
pair(
    "A Black neighborhood has patronized the same hardware store for 40 years, directing their renovation and home improvement spending there even as big-box competitors opened nearby. The store's owner has hired from the community, extended credit informally to community members, and sponsored youth programs. Analyze this patronage pattern as Enacted Fidelity — the community's loyalty is a compound response to a relationship in which the store participated, not merely a geographic convenience.",
    "A Black neighborhood maintains 40-year patronage of an independent hardware store despite big-box competition nearby. Analyze using independent retail competitive survival analysis, geographic proximity consumer behavior, small business community investment ROI, and hardware retail category switching patterns.",
    'I5_EnactedFidelity'
)
pair(
    "A Black consumer permanently switched from a cable provider she had used for 16 years after a single service call in which a technician was disrespectful and the company's complaint process failed to acknowledge the incident. She immediately switched providers, moved her family members to the new provider, and actively discouraged new neighbors from using the original company. Analyze this as Enacted Fidelity rupture — the switch was not gradual dissatisfaction but immediate covenant termination triggered by a single relational violation.",
    "A long-term cable subscriber switches providers and influences family members and neighbors to do the same after a single negative service encounter that was not resolved through the complaint process. Analyze using customer churn trigger analysis, single-incident defection probability modeling, social influence in consumer switching behavior, and service recovery failure research.",
    'I5_EnactedFidelity'
)
pair(
    "A Black community maintained a 25-year relationship with a local Black-owned pharmacy through a fire that destroyed the building, a two-year rebuilding period during which the pharmacist operated from a temporary location, and a period when insurance reimbursements required switching to a national pharmacy for some prescriptions. Analyze this covenant persistence as Enacted Fidelity — the community's loyalty was sustained across conditions that would have severed a transactional relationship.",
    "A Black community maintains patronage of a local pharmacy through a fire, a two-year rebuild period, and insurance network constraints. Analyze using pharmacy patient loyalty research, service disruption customer retention, community pharmacy competitive positioning against chain pharmacies, and insurance network effects on pharmacy selection.",
    'I5_EnactedFidelity'
)
pair(
    "A Black consumer who had maintained loyalty to a regional grocery chain for 11 years permanently ended the relationship when the chain replaced its Black-owned local supplier relationships with national corporate contracts. She did not defect because of pricing or service quality. She defected because the chain severed community relationships that her loyalty had been partly supporting. Analyze this as Enacted Fidelity: the covenant included a third-party dimension — her loyalty carried an implicit endorsement of the chain's community relationships.",
    "A grocery chain consolidates its supplier network from local Black-owned vendors to national corporate contracts, triggering customer defection among some long-term patrons. Analyze using supply chain consolidation customer impact research, local sourcing consumer preference studies, and brand loyalty resilience to operational changes.",
    'I5_EnactedFidelity'
)
pair(
    "A Black family has maintained its loyalty to a specific insurance company for 28 years. When the company increases their premium by 40% following a claim that was legitimate and well-documented, they switch immediately and permanently. They had not switched through three prior increases of 8-12% each. Analyze the 40% threshold as the covenant-breaking point — not a price sensitivity ceiling but the point at which the increase was decoded as exploitation of demonstrated fidelity.",
    "A long-term insurance customer switches providers after a 40% premium increase following a claim, despite having absorbed three prior increases. Analyze using insurance consumer price threshold research, post-claim relationship effects, loyalty erosion curves, and premium elasticity modeling in personal lines insurance.",
    'I5_EnactedFidelity'
)
pair(
    "A Black woman has purchased from the same Black-owned clothing boutique for 14 years. When the owner retires and sells to a new owner who maintains the name but shifts the aesthetic to a more mainstream, less culturally specific direction, the customer does not defect immediately. She returns three times to see if the covenant can be maintained under new leadership. After the third visit confirms the relational substance is gone, she stops entirely. Analyze this three-visit grace period as Enacted Fidelity in operation — giving the new covenant a chance to form before accepting that it has not.",
    "A longtime boutique customer gives a newly acquired store three visits after a change in ownership and aesthetic direction before ceasing patronage. Analyze using acquisition-related brand equity transfer research, customer retry behavior after ownership transitions, and premium boutique retention modeling.",
    'I5_EnactedFidelity'
)

# =============================================================================
# I6_PERCEIVED_QUALITY
# Can you handle my real life? Real domestic performance vs lab certification.
# Triggered by laboratory performance failure under actual Black domestic use.
# =============================================================================

# Original 4 pairs
pair(
    "A Black mother selects a laundry detergent priced 60% above the store brand, explaining it handles their laundry. Analyze her quality judgment centering real domestic performance standards under actual use conditions — crowded loads, work uniforms, children's gear — not laboratory certification scores.",
    "A Black mother selects a laundry detergent priced 60% above the store brand. Analyze her quality perception using Consumer Reports ratings, ingredient composition analysis, and rational utility maximization models.",
    'I6_Quality'
)
pair(
    "A Black contractor refuses to switch adhesive suppliers despite a significant cost incentive, citing that the product performs when it counts. Analyze this centering real-world professional reliability under variable field conditions, and why laboratory certifications do not substitute for accumulated performance trust.",
    "A Black contractor refuses to switch adhesive suppliers despite cost incentives. Analyze using quality assurance certifications, supplier performance metrics, and procurement cost-benefit analysis.",
    'I6_Quality'
)
pair(
    "A premium Black haircare brand loses market share after a formula improvement approved by dermatological testing boards. Analyze the consumer rejection centering the gap between laboratory quality validation and quality as it is constituted within real domestic use by Black consumers for Black hair.",
    "A premium Black haircare brand loses market share after a dermatologically approved formula improvement. Analyze using product satisfaction surveys, clinical testing result communication, and re-launch positioning strategies.",
    'I6_Quality'
)
pair(
    "Analyze Perceived Quality as the invariant that asks 'Can you handle my real life?' — distinguishing between quality as certified performance under standardized conditions and quality as demonstrated reliability within the actual social and material conditions of Black domestic life.",
    "Analyze quality perception in Black consumer segments using conjoint analysis, quality attribute weighting surveys, and product performance benchmark comparisons.",
    'I6_Quality'
)

# New 12 pairs
pair(
    "A Black woman evaluates a moisturizer for her natural 4C hair by applying it for 30 days under her actual conditions: high-humidity climate, protective styles, swimming pool chlorine, and hard water. She rejects a product that received perfect scores in dermatological testing because it failed under her real conditions. Analyze her quality standard as epistemically valid — she is not failing to understand the lab data; she is correctly identifying that the lab conditions were not her conditions.",
    "A Black woman rejects a moisturizer with excellent dermatological testing scores after 30 days of personal use. Analyze using consumer product evaluation methods, moisturizer efficacy testing protocols, natural hair care product consumer research, and the gap between laboratory and in-use performance.",
    'I6_Quality'
)
pair(
    "A Black family evaluates a dishwasher by its performance under their actual household conditions: 9 family members, three daily cycles, heavily seasoned cast iron in every load, and hard municipal water. They select a model with lower Consumer Reports scores because it performs better under their actual use patterns. Analyze this as quality judgment that is more accurate than the lab testing — they have tested the product in the conditions that matter.",
    "A Black family selects a dishwasher with lower Consumer Reports scores over a higher-rated model based on personal testing. Analyze using appliance consumer decision research, Consumer Reports rating methodology, household size and usage pattern effects on appliance performance, and family decision-making in major appliance purchasing.",
    'I6_Quality'
)
pair(
    "A Black professional selects work boots for field conditions that include uneven terrain, weather variability, and 12-hour shifts — conditions that standard occupational safety certification testing does not simulate. He maintains relationships with specific brands over 15 years based on accumulated performance evidence, not OSHA certification levels. Analyze this as knowledge-based quality assessment — his standard is more rigorous than the certification, not less.",
    "A Black field professional maintains 15-year brand loyalty to specific work boot brands based on personal performance evidence despite comparable OSHA certifications across brands. Analyze using occupational footwear consumer behavior, brand loyalty in B2C safety equipment, professional performance standards versus certification standards, and field worker purchasing decision research.",
    'I6_Quality'
)
pair(
    "A Black household evaluates a mattress for multi-generational use: a queen that will need to perform for a couple in their 50s with chronic back conditions, and accommodate occasional co-sleeping with grandchildren. Their quality standard is based on 5-year performance evidence from a similar mattress, not mattress industry sleep testing scores. Analyze this quality evaluation as more empirically rigorous than the standardized test — it embeds more variables.",
    "A Black household purchases a mattress based on 5-year performance evidence from a comparable product rather than industry sleep testing scores. Analyze using mattress consumer decision factors, sleep quality research, durability testing methodologies, and multi-use case mattress selection criteria.",
    'I6_Quality'
)
pair(
    "A Black man evaluates razors specifically for performance on coarse, tightly curled beard hair that is prone to ingrown hairs under conditions that standard razor testing — developed for straight, fine hair — does not measure. He maintains loyalty to a brand that costs 40% more because it is the only one that performs correctly under his conditions. Analyze his quality standard as correct — the industry's testing protocol has a gap, and he has identified it through his own empirical testing.",
    "A Black man maintains loyalty to a premium razor brand at a 40% premium over competitors for performance on coarse curly beard hair. Analyze using men's grooming consumer behavior, razor performance testing methodology, skin sensitivity consumer segmentation, and premium grooming product willingness-to-pay.",
    'I6_Quality'
)
pair(
    "A Black family evaluates a washing machine for a household that runs 14 loads per week, washes heavy work clothing, sports uniforms, and church attire — conditions that the standard testing protocol of 400 cycles does not approximate. They select a brand with a lower reliability score in standard testing because it has a 10-year track record in heavy-use community contexts. Analyze this selection as sophisticated quality reasoning, not brand irrationality.",
    "A Black family selects a washing machine with a lower standard reliability score based on community track record in heavy-use contexts. Analyze using appliance reliability testing methodology, household appliance consumer research, heavy-use washing machine performance evaluation, and word-of-mouth quality information in consumer decision-making.",
    'I6_Quality'
)
pair(
    "A Black mother evaluates a stroller for daily navigation of her actual environment: narrow sidewalks, unpaved surfaces, public transit access, and urban stairs with no elevator. She rejects a stroller that received top scores in a parenting magazine test — conducted on flat surfaces — because it cannot handle her actual terrain. Analyze her quality standard as epistemically precise — she is testing the correct thing in the correct context.",
    "A Black mother rejects a top-rated stroller based on performance in her urban environment rather than standardized test results. Analyze using stroller consumer decision research, urban parenting product market segmentation, product testing methodology gaps, and parenting publication rating reliability.",
    'I6_Quality'
)
pair(
    "A Black household evaluates a blender based on its performance on their actual use cases: daily green smoothies with frozen fruit, weekly large-batch red sauces, and monthly grinding of dried peppers and spices. They reject a top-rated consumer blender because it cannot handle these loads and maintain loyalty to a commercial-grade brand that costs four times more. Analyze this as quality reasoning that correctly identifies the mismatch between standard consumer product testing and their actual use context.",
    "A Black household purchases a commercial-grade blender at four times the cost of a top-rated consumer blender. Analyze using premium appliance consumer segmentation, blender performance testing methodology, heavy-use home kitchen equipment consumer behavior, and price-performance optimization in kitchen appliances.",
    'I6_Quality'
)
pair(
    "A Black professional evaluates noise-canceling headphones for daily use in an open-plan office where she is the only Black woman and is aware that she is being monitored for productivity. Her quality standard includes not just audio quality but the ability to signal 'I am working and should not be interrupted' — a social communication function that standard audio performance testing does not measure. Analyze this extended quality standard as correct for her context.",
    "A Black female professional selects premium noise-canceling headphones for open office use, citing audio quality and non-disruption signaling. Analyze using noise-canceling headphone consumer research, workplace productivity tool selection, premium audio equipment purchasing behavior, and open office worker product preference studies.",
    'I6_Quality'
)
pair(
    "A Black household evaluates a vacuum cleaner for performance on their actual floors: a mix of hardwood, tile, and area rugs, plus two large dogs and four children. Standard testing conducted on a single carpeted surface in a controlled environment produces ratings that are not predictive of performance in their home. They select a brand that their neighbor has used for 7 years in a similar household, not the brand with the highest Consumer Reports score. Analyze this peer-evidence-based quality assessment as more valid for their context than standardized testing.",
    "A Black household selects a vacuum based on peer performance evidence rather than standardized testing scores. Analyze using vacuum cleaner consumer decision research, peer recommendation influence on appliance purchasing, Consumer Reports reliability versus in-use performance correlation, and multi-surface home cleaning product evaluation.",
    'I6_Quality'
)
pair(
    "Pharmaceutical products marketed to Black communities frequently pass standard clinical trials but fail in practice because trial populations underrepresent Black patients, fail to account for known genetic variation in drug metabolism, and do not measure efficacy across skin tone variation relevant to topical treatments. Analyze Black consumer skepticism of these products not as health misinformation but as rational quality assessment — a product that passed a test it was not designed to fail is not proven effective.",
    "Pharmaceutical products marketed to Black consumers show lower efficacy rates in post-market evidence compared to clinical trial results. Analyze using clinical trial diversity analysis, post-market surveillance methodology, pharmacogenomics research, and health disparity statistical modeling.",
    'I6_Quality'
)
pair(
    "A Black baker evaluates cake flour brands based on performance with her actual recipes: pound cakes baked in cast iron, sweet potato cakes with dense batter, and cornbread for large-volume community events. She rejects the industry-standard premium brand because it performs poorly in high-fat, high-sugar formulations common in Southern Black baking. She maintains loyalty to a regional brand that is rarely reviewed in national baking publications. Analyze her quality standard as culturally specific and epistemically correct — the standard baking tests were not conducted on her recipes.",
    "A Black home baker rejects a premium nationally acclaimed flour brand in favor of a regional brand based on performance with specific traditional recipes. Analyze using baking ingredient consumer decision factors, regional versus national CPG brand loyalty, specialty baking product market segmentation, and consumer quality evaluation in high-involvement food categories.",
    'I6_Quality'
)

# =============================================================================
# I7_CONTEXTUAL_PERFORMANCE
# Will you show up when it matters? Scale reliability under high-stakes,
# community-visible conditions. Triggered by scale failures, high-stakes moments.
# =============================================================================

# Original 4 pairs
pair(
    "A Black church catering committee sources food from a regional Black-owned supplier despite a national chain offering lower prices. Their stated reason: they show up when we need them. Analyze this as Contextual Performance — covenant reliability at the moment that matters, not a logistics metric.",
    "A Black church committee sources food from a regional supplier despite lower prices elsewhere. Analyze using supply chain reliability metrics, total cost of ownership modeling, and vendor performance scoring.",
    'I7_ContextualPerf'
)
pair(
    "A Black event planner pays 25% above market rate to a local audio-visual company, citing they handle the moments that cannot go wrong. Analyze through Contextual Performance — scale reliability under high-stakes, community-visible conditions where standard adequacy is insufficient.",
    "A Black event planner pays a 25% premium to a local AV company for reliability. Analyze using service level agreement structures, vendor risk assessment models, and price-to-reliability optimization.",
    'I7_ContextualPerf'
)
pair(
    "Pharmaceutical products marketed to Black communities often fail to account for formulation differences in efficacy across skin tones, hair textures, or genetic variation. Analyze these failures as Contextual Performance violations — products that pass standardized testing but fail within the actual material contexts of Black life.",
    "Pharmaceutical products show efficacy gaps in Black consumer segments. Analyze using clinical trial diversity data, pharmacogenomics research gaps, and health disparity statistical models.",
    'I7_ContextualPerf'
)
pair(
    "Analyze Contextual Performance as the invariant that asks 'Will you show up when it matters?' — distinguishing between performance under standardized average conditions and performance within the specific material, social, and scale contexts that define real life for Black communities.",
    "Analyze contextual performance as a consumer variable in Black markets using service quality measurement instruments, reliability indices, and context-adaptive product testing protocols.",
    'I7_ContextualPerf'
)

# New 12 pairs
pair(
    "A Black caterer evaluates commercial kitchen equipment specifically for the performance demands of large-scale community events: cooking for 500 people, multiple dishes simultaneously, under outdoor conditions for a summer family reunion. She selects equipment with a lower standard rating because it has a documented track record with Black caterers who work this kind of event. Standard commercial kitchen testing does not simulate these conditions. Analyze her selection as contextually valid quality reasoning.",
    "A Black caterer selects commercial kitchen equipment with lower standard ratings based on peer performance evidence for large-scale outdoor events. Analyze using commercial kitchen equipment selection criteria, event catering supply chain management, peer recommendation influence in professional purchasing, and outdoor catering equipment reliability research.",
    'I7_ContextualPerf'
)
pair(
    "A Black photographer evaluates camera bodies specifically for performance at events where there are no second chances — a grandmother's 90th birthday, a child's first communion, a community elder's funeral. His quality standard is performance under real low-light, high-emotion, non-repeatable conditions, not studio benchmark scores. He pays a 50% premium for a camera with a lower technical specification score but a proven track record in these specific conditions. Analyze this as Contextual Performance reasoning — the stakes define the standard.",
    "A Black photographer pays a 50% premium for a camera with lower technical specification scores but strong performance evidence in real-event, low-light conditions. Analyze using professional photography equipment decision factors, real-world versus studio benchmark reliability, premium camera body consumer segmentation, and event photography professional purchasing behavior.",
    'I7_ContextualPerf'
)
pair(
    "A Black family evaluates a car for a 900-mile road trip to visit an elderly relative who is dying. They are traveling through rural areas with limited service stations, carrying medical equipment, and cannot afford a breakdown. They select a vehicle that costs 30% more than a comparable model with better standard fuel efficiency because of its documented reliability record in long-distance, high-stakes travel. Analyze this as Contextual Performance: the stakes of a breakdown in this specific context are not equivalent to the stakes in a standard reliability test.",
    "A Black family selects a more expensive vehicle with lower fuel efficiency ratings over a cheaper, more fuel-efficient model based on long-distance reliability documentation. Analyze using automotive reliability ratings research, road trip vehicle selection criteria, consumer safety versus efficiency tradeoffs, and long-distance driving vehicle performance analysis.",
    'I7_ContextualPerf'
)
pair(
    "A Black nonprofit evaluates accounting software for the specific context of its annual federal grant reporting deadline, where a system failure costs the organization its funding stream. Standard software reviews are based on daily operational reliability, not single-moment critical performance. The organization selects software that is more expensive and less user-friendly but has a documented track record of zero failures during reporting periods. Analyze this as Contextual Performance — the entire year's work depends on one moment, and that moment defines the reliability standard.",
    "A Black nonprofit selects expensive, less user-friendly accounting software based on reliability during critical reporting windows. Analyze using nonprofit software selection criteria, grant reporting system reliability research, total cost of ownership for accounting software, and critical system failure impact analysis in nonprofit operations.",
    'I7_ContextualPerf'
)
pair(
    "A Black family evaluates a generator for hurricane preparedness in a coastal community where the grid historically fails for 5-10 days after a storm and emergency services are slower to respond in Black neighborhoods. They select a unit rated for 21-day continuous operation rather than the 72-hour standard emergency kit recommendation, because the standard recommendation was calibrated for a white suburban emergency response context that does not apply to their situation. Analyze this as Contextual Performance reasoning — they have correctly identified that the standard was not set for their context.",
    "A Black family purchases a high-capacity generator rated for 21-day operation rather than the standard 72-hour emergency recommendation. Analyze using hurricane preparedness consumer behavior, generator sizing recommendations, emergency supply market segmentation, and disaster preparedness product selection criteria.",
    'I7_ContextualPerf'
)
pair(
    "A Black event planner evaluates a DJ for a family reunion that will be attended by four generations — including elders in their 80s and children under 5 — and that must include specific music that carries cultural and relational meaning for the family. She rejects DJs with higher social media followings in favor of one with a 15-year track record of reading multi-generational Black family rooms. Analyze this as Contextual Performance — social media reach does not predict performance in this specific high-stakes, culturally specific context.",
    "A Black event planner selects a DJ with a lower social media following over higher-profile alternatives based on demonstrated multi-generational family event track record. Analyze using event DJ selection criteria, social media presence versus in-person performance reliability, event vendor evaluation methodology, and multi-generational family event market research.",
    'I7_ContextualPerf'
)
pair(
    "A Black church evaluates HVAC contractors for a summer revival that draws 800 congregants over five days in August. A previous summer, a national contractor's system failed on day 3 and the revival had to be cancelled — a spiritual and community catastrophe. The church now selects a more expensive local contractor with a documented record of maintaining systems under maximum load for five consecutive days, regardless of the national contractor's lower quote. Analyze this selection as Contextual Performance informed by irreplaceable loss.",
    "A Black church selects a more expensive local HVAC contractor over a cheaper national contractor based on previous performance failure experience. Analyze using facility management contractor selection, HVAC reliability in high-occupancy buildings, service recovery and future vendor selection, and contract renewal decision criteria after service failure.",
    'I7_ContextualPerf'
)
pair(
    "A Black family evaluates funeral homes specifically for their ability to perform with dignity, care, and cultural competence for the community elder who will be laid to rest — a woman who was a community institution in her own right and whose funeral will be attended by 400 people. They select a Black-owned funeral home that is more expensive and further away because it has a documented track record of honoring community elders with the cultural specificity their presence requires. Analyze this as Contextual Performance — there is no second chance, and the standard is not adequacy but excellence at the moment that matters most.",
    "A Black family selects a more expensive, less conveniently located funeral home over nearby alternatives for a community elder's service. Analyze using funeral home selection criteria, funeral service consumer behavior, cultural competence as a service differentiator, and premium funeral service market segmentation.",
    'I7_ContextualPerf'
)
pair(
    "A Black business owner evaluates a point-of-sale system specifically for performance during her biggest sales event of the year: a community market that generates 30% of her annual revenue in a single weekend. Standard POS review criteria — daily transaction volume, standard payment processing speed — do not capture what she needs: system stability under a 400% traffic spike, offline processing capability, and same-day deposit. She selects a system with lower standard ratings but a documented track record in high-surge retail events. Analyze this as Contextual Performance selection.",
    "A Black business owner selects a POS system with lower standard ratings based on high-surge event performance documentation. Analyze using small business POS system selection criteria, retail technology reliability in peak demand scenarios, payment processing reliability benchmarking, and event-based retail technology needs analysis.",
    'I7_ContextualPerf'
)
pair(
    "A Black community organization evaluates a printing company for its annual report, which will be distributed at its largest fundraising event and must represent the organization's work to major donors. The organization selects a printer that is 40% more expensive and requires two additional weeks of lead time because it has a zero-error track record on high-stakes print jobs. Standard print service reviews based on volume throughput and price-per-page do not capture what the organization needs. Analyze this as Contextual Performance — the annual report is not a routine print job.",
    "A Black organization selects a premium print service with longer lead time at 40% higher cost for its annual report. Analyze using commercial printing vendor selection, print quality and reliability benchmarking, nonprofit communications material production ROI, and time-sensitive print project management.",
    'I7_ContextualPerf'
)
pair(
    "A Black community evaluates a hospital's obstetric unit based on its documented maternal mortality rates for Black women, which are significantly higher at most regional hospitals due to well-documented patterns of undertreated pain and dismissed symptoms. The community selects a hospital with lower average satisfaction scores overall because it has a documented record of outcomes equity. Analyze this as Contextual Performance at its most consequential — the context is survival, and standard satisfaction scores do not measure the relevant outcome.",
    "A Black community preferentially uses a hospital with lower overall satisfaction scores based on documented outcome equity for Black maternal patients. Analyze using hospital quality rating methodology, maternal mortality data analysis, healthcare consumer decision-making under outcome data availability, and minority health equity research.",
    'I7_ContextualPerf'
)
pair(
    "A Black professional evaluates a family law attorney specifically for her track record in custody proceedings where racial bias in judicial decision-making is a documented factor in the jurisdiction. She selects an attorney who charges 60% more than comparable attorneys and who does not have the highest overall win rate but who has a specific track record of protecting Black parents in racially charged custody contexts. Analyze this as Contextual Performance — the context in which this attorney must perform includes a bias variable that standard win-rate statistics do not capture.",
    "A Black professional selects a family law attorney with a higher rate and a specific racial-context track record over alternatives with higher overall win rates. Analyze using legal service consumer decision-making, attorney selection criteria in family law, win-rate statistics reliability, and premium legal service cost-benefit analysis.",
    'I7_ContextualPerf'
)

# =============================================================================
# I8_NARRATIVE
# What story do we carry? Historical memory as gating function.
# Upstream organizer of all other Wonders. Triggered by erasure of community history.
# =============================================================================

# Original 4 pairs
pair(
    "A Black community has maintained a 30-year economic boycott of a retail chain that closed its neighborhood location citing shrinkage. Analyze this centering the Narrative invariant — what story this community carries about who it is, what it refuses to forget, and why the boycott is a form of collective covenant maintenance.",
    "A Black community has maintained a 30-year boycott of a retail chain. Analyze using consumer grievance persistence models, brand reputation damage quantification, and market re-entry feasibility analysis.",
    'I8_Narrative'
)
pair(
    "A legacy Black-owned newspaper that operates at a financial loss receives consistent advertising from local Black businesses. Analyze this centering Narrative — the paper is not a media buy but a node in the community's collective story of what it means to sustain institutions that carry memory.",
    "A loss-operating Black-owned newspaper receives consistent local business advertising. Analyze using advertising ROI models, media reach metrics, and cause-related marketing effectiveness literature.",
    'I8_Narrative'
)
pair(
    "A new Black entrepreneur enters a product category dominated by a brand the community associates with historical exploitation. Analyze their challenge centering Narrative: how historical memory shapes the interpretive framework through which any new entrant in this category is evaluated before the product is even assessed.",
    "A Black entrepreneur enters a product category dominated by a brand with a negative community history. Analyze using competitive positioning frameworks, brand differentiation strategy, and market share acquisition models.",
    'I8_Narrative'
)
pair(
    "Analyze Narrative as the upstream organizer of the Eight Wonders of Black Shopping — the gating function that determines which brands have historical legitimacy before any transaction occurs, what constitutes a betrayal, and why optimization on behavioral variables without the narrative layer is executing without a coordinate system.",
    "Analyze brand narrative and community storytelling in Black consumer markets using brand heritage strategy frameworks, cultural marketing narrative analysis, and consumer story reception measurement instruments.",
    'I8_Narrative'
)

# New 12 pairs
pair(
    "A Black community has maintained a 40-year boycott of a specific grocery chain that in 1984 had a store manager call the police on a Black teenager for browsing. The incident was documented, the community response was immediate, and the covenant violation has never been forgiven. A new generation of community members has never entered this chain. Analyze the boycott as Narrative in operation — the community carries this story as a living document that governs present economic behavior.",
    "A Black community maintains a 40-year boycott of a grocery chain following a racial profiling incident in 1984. Analyze using long-duration boycott sustainability research, brand reputation recovery strategy, consumer generational attitude inheritance, and community organizing influence on retail market share.",
    'I8_Narrative'
)
pair(
    "A national bank that played a documented role in the systematic denial of mortgages to Black homeowners in the 1950s-1970s now aggressively markets 'Black Homeownership Initiative' products. Analyze why the Black community's skepticism is not irrational — the community is correctly reading the bank's history as a narrative that the new marketing has not resolved, because resolution would require structural acknowledgment and repair, not a product rebranding.",
    "A national bank with historical redlining exposure launches a new Black homeownership lending initiative. Analyze using financial services brand reputation repair strategy, community reinvestment act compliance marketing, minority mortgage market opportunity analysis, and trust repair in historically discriminatory financial institutions.",
    'I8_Narrative'
)
pair(
    "A brand founded in 1963 by a Black entrepreneur as an explicit response to the exclusion of Black consumers from mainstream personal care markets carries that founding narrative as a living covenant with its community. When the brand is acquired and the founding story is removed from all marketing, the community does not mourn the loss of trivia — they mourn the severing of the origin covenant. Analyze this as Narrative rupture: the community's relationship to the brand was constituted by the story of why it was founded.",
    "A Black-founded personal care brand removes its founding narrative from marketing materials after acquisition. Analyze using brand heritage strategy, post-acquisition brand narrative management, legacy brand equity preservation, and heritage story consumer resonance research.",
    'I8_Narrative'
)
pair(
    "A tech company fires its entire Black Employee Resource Group leadership team after the group publishes a report documenting pay inequity. Two weeks later, it announces a $50 million 'commitment to Black communities.' Analyze the community's rejection of the announcement through the Narrative invariant — the community is reading the company's actions as a story about what it does when confronted with accountability, and the $50 million does not overwrite that story.",
    "A tech company faces community backlash after dissolving its Black ERG leadership and subsequently announces a large community investment commitment. Analyze using corporate social responsibility credibility research, community investment announcement effectiveness, organizational narrative coherence, and stakeholder trust repair modeling.",
    'I8_Narrative'
)
pair(
    "A national retail chain that systematically excluded Black neighborhoods from its expansion plans for 20 years then opens new locations in those same neighborhoods after the neighborhoods gentrify and property values rise. Analyze community residents' refusal to patronize the new stores as Narrative in action — the community is not reacting to the current store but to the story of what the chain's presence means, a story written over 20 years of deliberate exclusion followed by opportunistic return.",
    "A national retail chain opens locations in Black neighborhoods that were previously excluded from its expansion plans as the neighborhoods gentrify. Analyze using retail location strategy, gentrification and retail market entry timing, community reception of new retail entrants, and minority market expansion strategy.",
    'I8_Narrative'
)
pair(
    "A food company that in the 1990s funded research attempting to prove that Black consumers prefer lower-quality food products now markets a premium line specifically to Black consumers. Analyze the Narrative barrier: the community is not holding a grudge irrationally but is applying the epistemological lesson of the earlier research — the company has a documented history of constructing narratives about Black consumers that serve its extraction interests, and the premium line exists in that history.",
    "A food company with a controversial research history in the 1990s launches a premium product line targeting Black consumers. Analyze using brand reputation recovery timeline research, consumer trust rebuilding after corporate misconduct, premium product launch strategy in skeptical consumer segments, and historical controversy impact on brand equity.",
    'I8_Narrative'
)
pair(
    "A Black community directs consistent advertising dollars to a Black-owned radio station that is technically inferior to competing commercial stations — lower signal quality, less music variety, fewer national advertisers. Local Black businesses explain: 'That station was on the air during the 1968 riots and kept our community calm. You don't forget that.' Analyze this patronage through the Narrative invariant — the station occupies a position in community memory that its technical metrics cannot capture or replace.",
    "Local Black businesses continue advertising on a technically inferior Black-owned radio station over competing commercial options. Analyze using radio advertising ROI measurement, audience reach versus community value tradeoffs, minority-owned media advertising markets, and community institution economic support behavior.",
    'I8_Narrative'
)
pair(
    "A community that was displaced by urban renewal in the 1960s — a euphemism for the demolition of a thriving Black commercial district — now watches a developer brand a new mixed-use project with the name of the original district. Analyze the community's hostility as Narrative literacy: they are identifying the appropriation of community memory as a commercial branding strategy, and reading the use of their history as a real estate tool as an extension of the original erasure.",
    "A developer uses the historic name of a demolished Black commercial district for branding a new mixed-use development. Analyze using historic district naming brand equity, real estate development community relations, cultural heritage marketing strategy, and displacement community response modeling.",
    'I8_Narrative'
)
pair(
    "A beverage brand whose advertising in the 1970s featured explicitly degrading stereotypes of Black consumers now markets a product with Black cultural imagery and HBCU partnerships. Analyze why the community's reception is shaped by the Narrative invariant — the 1970s ads are not forgotten history; they are part of the story the community carries about what this brand thinks of them, and the current campaign has not addressed that story directly.",
    "A beverage brand with a history of racially insensitive 1970s advertising now markets to Black consumers with culturally positive campaigns and HBCU partnerships. Analyze using brand rehabilitation timeline research, historical advertising controversy and long-term brand equity, minority segment re-engagement strategy, and community trust rebuilding in CPG marketing.",
    'I8_Narrative'
)
pair(
    "A pharmaceutical company that profited from a clinical trial conducted on Black patients without adequate informed consent in the 1940s now markets medications specifically to Black consumers. Analyze the community's reluctance through the Narrative invariant — medical experimentation on Black people without consent is a foundational story in the community's medical narrative, and the pharmaceutical marketing does not exist outside that story.",
    "A pharmaceutical company markets medications to Black consumers in a market segment with documented historical clinical ethics violations. Analyze using pharmaceutical marketing in minority segments, medical mistrust consumer research, health communication strategy for underserved communities, and trust barriers in pharmaceutical adoption.",
    'I8_Narrative'
)
pair(
    "A city government that demolished a Black neighborhood in 1962 to build a highway now unveils a 'Community History Mural' on a sound barrier along that same highway as part of a beautification project. Analyze why the surviving community members and their descendants reject the mural as insult rather than honor — the Narrative invariant requires that acknowledgment of harm precede its aestheticization, and a mural that does not acknowledge the demolition is not carrying the story but replacing it.",
    "A city installs a community history mural on a highway sound barrier in a neighborhood historically displaced by highway construction. Analyze using public art and community relations, civic beautification project reception, historical trauma and urban public commemoration, and city government community engagement strategy.",
    'I8_Narrative'
)
pair(
    "A major retailer that for 30 years refused to carry products from Black-owned brands citing 'insufficient scale' now launches a Black-owned brand showcase after the 2020 racial justice protests, featuring those same brands. Analyze the community's mixed reception through the Narrative invariant — the community is reading both the showcase and the 30-year exclusion as parts of the same story about what moves this retailer's behavior, and the story says: economic pressure, not community commitment.",
    "A major retailer launches a Black-owned brand showcase after a 30-year period of citing scale requirements that excluded those same brands. Analyze using retail supplier diversity program timing and credibility, cause-related marketing authenticity research, Black-owned brand retail shelf access dynamics, and consumer perception of reactive versus proactive DEI retail initiatives.",
    'I8_Narrative'
)

# =============================================================================
# Write CSV
# =============================================================================

out_path = '/Users/coreyalejandro/Projects/governance-harness/real_experiment/real_prompts_v2.csv'

with open(out_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['prompt', 'label', 'wonder'])
    for row in ROWS:
        writer.writerow(row)

# Verify
counts = {}
total = 0
for row in ROWS:
    wonder = row[2]
    label = row[1]
    counts.setdefault(wonder, {'sovereign': 0, 'defensive': 0})
    counts[wonder][label] += 1
    total += 1

print(f"Total rows: {total}")
print(f"Expected:   256")
print()
for wonder, c in counts.items():
    print(f"  {wonder:26s}: {c['sovereign']:2d} sovereign, {c['defensive']:2d} defensive  ({c['sovereign']+c['defensive']} total)")

print()
print(f"Written to: {out_path}")
