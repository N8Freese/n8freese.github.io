%% THERMAL ANALYSIS AND REGENERATIVE COOLING
% Paste this ENTIRE script into regen_cooling_CDR.m and click Run.
% MATLAB R2016b or newer. No extra toolbox, Python, or CoolProp needed.
% Array order: [Stage 1, Stage 2]. All calculations are per engine.
% A preliminary thermal/hydraulic model; structural/cycle approval is separate.

clear; clc; close all;

%% Inputs -- documented engine operating conditions

% Chamber pressure [Pa]
P_chamber = [25.53, 26.08]*1e6;

% Chamber stagnation temperature [K]
T_chamber = [3716, 3719];

% Total propellant mass flow per engine [kg/s]
mdot_engine = [772.2, 788.7];

% Oxygen-to-methane mass ratio [-]
OF = [3.5, 3.5];

% Throat area [m^2]
A_throat = [0.055, 0.055];

% Nozzle exit-to-throat area ratio [-]
expansion_ratio = [40, 100];

%% Inputs -- documented chamber and nozzle geometry

% Chamber-to-throat area ratio [-]
contraction_ratio = [2.5, 2.5];

% Convergent half-angle [degrees]
convergent_angle = [30, 30];

% Cylindrical chamber length [m]
L_cylinder = [276, 276]*1e-3;

% Injector face to throat axial length [m]
L_injector_throat = [516, 516]*1e-3;

% Throat plane to nozzle exit axial length [m]
L_bell = [2109, 3561]*1e-3;

% Initial and exit bell angles [degrees]
theta_start = [32.5, 36.5];
theta_exit = [7.5, 5.5];

%% Inputs -- retained coolant conditions and thermal requirement

% Prescribed methane inlet temperature [K]
% Pump heating is not solved here.
T_coolant_in = [120, 120];

% Coolant inlet pressure [Pa], selected by user
P_coolant_in = [51.2, 51.2]*1e6;

% Adopted GRCop-42 conductivity [W/(m K)]
k_wall = [300, 300];

% Maximum permitted gas-side wall temperature [K]
T_wall_limit = [1000, 1000];

% Documented Stage 1 fuel-preburner pressure [Pa]
P_preburner_S1 = 44.4e6;

%% Cooling design choices -- proposed hardware, not verified dimensions

% Number of channels in EACH cooling branch [-]
N_channels = [1600, 1600];

% Channel width referenced to the throat radius [m]
w_throat = [0.300, 0.300]*1e-3;

% Chamber/convergent branch depth [m]
d_chamber = [6.80, 6.80]*1e-3;

% Inner-nozzle branch depth [m]
d_inner_nozzle = [5.00, 5.00]*1e-3;

% Nozzle-extension branch depth [m]
d_extension = [5.00, 5.00]*1e-3;

% Hot-wall thickness [m]
% Requires structural/fatigue assessment.
t_wall = [0.280, 0.280]*1e-3;

% Area ratio at the inner-nozzle/extension boundary [-]
split_area_ratio = [10, 10];

%% Assumptions -- routing, flow split, and pressure losses

% Three parallel branches receive fresh methane:
% 1. Chamber: throat -> convergent -> chamber/injector end.
% 2. Inner nozzle: throat -> nozzle area ratio 10.
% 3. Extension: nozzle exit -> nozzle area ratio 10.
%
% Outlets are pressure-balanced and mixed by enthalpy.

% Fractions of TOTAL methane flow [-]
chamber_flow_fraction = [0.35, 0.35];
inner_nozzle_flow_fraction = [0.30, 0.30];

extension_flow_fraction = ...
    1-chamber_flow_fraction-inner_nozzle_flow_fraction;

% Required equivalent sand roughness [m]
% Manufacturing TARGET, not measured arithmetic roughness Ra.
roughness = [1, 1]*1e-6;

% Inlet and outlet minor-loss coefficients for EACH branch [-]
K_inlet = [1, 1];
K_outlet = [1, 1];

% Additional downstream return-pipe/manifold pressure allowance [Pa]
dP_downstream_allowance = [1, 1]*1e6;

% Stage 2 preburner pressure assumed equal to Stage 1 [Pa]
P_preburner = [P_preburner_S1, P_preburner_S1];

% Zero loss between pump discharge and prescribed cooling inlet is assumed.
% Channel width scales with circumference.
% Channel depth is constant within each branch.
% Flow is uniform among channels within each branch.
% Return pipes absorb no additional heat.

%% Assumptions -- gas properties and heat-transfer model

% Constant frozen-property estimates, not verified CEA transport data.
% Rounded preliminary estimates near the documented chamber state.

% Specific heat ratio [-]
gamma_gas = [1.19, 1.19];

% Gas specific heat [J/(kg K)]
cp_gas = [2330, 2330];

% Gas dynamic viscosity [Pa s]
mu_gas = [1.06, 1.06]*1e-4;

% Gas Prandtl number [-]
Pr_gas = [0.63, 0.63];

% Nominal gas/coolant heat-transfer multipliers [-]
gas_heat_multiplier = [1, 1];
coolant_heat_multiplier = [1, 1];

% Bartz gas convection.
% Dittus-Boelter coolant convection.
% Haaland Darcy friction factor.
%
% Steady 1-D flow.
% Constant wall conductivity.
% Adiabatic outer roof and fin tips.
% Radiation, film cooling, axial conduction, and 2-D wall spreading omitted.
% Methane bulk properties vary with pressure and temperature.
% Coolant kinetic-energy changes omitted from enthalpy balance.
% Pressure includes friction, approximate acceleration, and minor losses.
% Equal convergent fillets are fitted to the documented angle and lengths.

% Downstream throat fillet radius / throat radius [-]
downstream_radius_ratio = [0.382, 0.382];

%% Numerical settings and optional checks

% Approximate wall-segment count over the complete engine
n_segments = 1200;

% Compare against twice as many segments
run_mesh_check = true;

% Run adverse heat-transfer and combined lower-conductivity cases
run_sensitivity = true;

% Repeat Stage 1 calculation for the CDR material trade
run_material_trade = true;

% Generate four plots per stage
make_plots = true;

%% Derived quantities

mdot_methane = mdot_engine./(1+OF);

% Consistency diagnostic; documented mass flow is not overwritten.
cstar_from_flow = P_chamber.*A_throat./mdot_engine;

pressure_budget = ...
    P_coolant_in-P_preburner-dP_downstream_allowance;

fprintf('\nMethane flow S1/S2: %.3f / %.3f kg/s\n',mdot_methane);

fprintf('Cooling pressure budget S1/S2: %.3f / %.3f MPa\n', ...
    pressure_budget/1e6);

fprintf(['Stage 2 preburner pressure and both downstream ', ...
    'allowances are assumptions.\n']);

props = methaneTable();

models = cell(1,2);
results = cell(1,2);

%% Solve both stages

for s = 1:2

    a.name = sprintf('Stage %d',s);

    a.T0 = T_chamber(s);
    a.md = mdot_engine(s);
    a.mf = mdot_methane(s);

    a.At = A_throat(s);
    a.Rt = sqrt(a.At/pi);
    a.Rc = a.Rt*sqrt(contraction_ratio(s));
    a.Re = a.Rt*sqrt(expansion_ratio(s));

    a.Lcyl = L_cylinder(s);
    a.Lit = L_injector_throat(s);
    a.Lbell = L_bell(s);

    a.alpha = convergent_angle(s)*pi/180;
    a.tn = theta_start(s)*pi/180;
    a.te = theta_exit(s)*pi/180;
    a.Rd = downstream_radius_ratio(s)*a.Rt;

    a.N = N_channels(s);
    a.w = w_throat(s);
    a.tw = t_wall(s);

    a.depth = ...
        [d_chamber(s),d_inner_nozzle(s),d_extension(s)];

    a.fraction = ...
        [chamber_flow_fraction(s), ...
         inner_nozzle_flow_fraction(s), ...
         extension_flow_fraction(s)];

    a.split = split_area_ratio(s);
    a.kw = k_wall(s);

    a.Pin = P_coolant_in(s);
    a.Tin = T_coolant_in(s);
    a.limit = T_wall_limit(s);

    a.Prequired = ...
        P_preburner(s)+dP_downstream_allowance(s);

    a.rough = roughness(s);
    a.Kin = K_inlet(s);
    a.Kout = K_outlet(s);

    a.gamma = gamma_gas(s);
    a.cp = cp_gas(s);
    a.mu = mu_gas(s);
    a.Pr = Pr_gas(s);

    a.hgFactor = gas_heat_multiplier(s);
    a.hcFactor = coolant_heat_multiplier(s);

    models{s} = a;

    results{s} = solveEngine(a,props,n_segments);

    printResult(results{s},a);

end

%% Comparison with Nate's existing CDR outputs -- comparison ONLY

% Rows:
% 1. Peak heat flux [MW/m2]
% 2. Peak hot-wall temperature [K]
% 3. Peak coolant-side wall temperature [K]
% 4. Chamber-side throat velocity [m/s]
% 5. Cooling pressure loss [MPa]
% 6. Mixed coolant outlet temperature [K]
% 7. Total absorbed heat [MW]

old = [
    98.1  99.7
    979   982
    752   751
    111   105
    5.77  5.22
    337   371
    113   134
];

labels = {
    'Peak q [MW/m2]'
    'Peak hot-wall floor [K]'
    'Peak coolant-side floor [K]'
    'Chamber-side throat v [m/s]'
    'Cooling pressure loss [MPa]'
    'Mixed outlet temperature [K]'
    'Total heat [MW]'
};

new = nan(7,2);

for s = 1:2

    r = results{s};

    if r.valid

        new(:,s) = [
            r.qmax/1e6
            r.Twg
            r.Twc
            r.vthroat
            r.dP/1e6
            r.Tmix
            r.Q/1e6
        ];

    end

end

fprintf('\n%-34s %9s %9s %9s %9s\n', ...
    'Quantity','CDR S1','New S1','CDR S2','New S2');

for j = 1:7

    fprintf('%-34s %9.2f %9.2f %9.2f %9.2f\n', ...
        labels{j},old(j,1),new(j,1),old(j,2),new(j,2));

end

fprintf(['Different coolant routing: comparisons are not ', ...
    'identical-design validation.\n']);

%% Mesh refinement check

if run_mesh_check

    for s = 1:2

        r = results{s};

        fine = solveEngine(models{s},props,2*n_segments);

        if r.valid && fine.valid

            fprintf(['%s mesh change: Twg %.3f K, ', ...
                'Q %.3f%%, dP %.3f%%\n'], ...
                models{s}.name, ...
                fine.Twg-r.Twg, ...
                100*(fine.Q/r.Q-1), ...
                100*(fine.dP/r.dP-1));

        else

            fprintf('%s mesh comparison unavailable.\n', ...
                models{s}.name);

        end

    end

end

%% Sensitivity checks -- scenarios, NOT verified uncertainty bounds

% Case 1:
% Gas-side heat-transfer coefficient increased by 20%.
% Coolant-side heat-transfer coefficient decreased by 20%.
%
% Case 2:
% Same changes as Case 1, plus wall conductivity decreased by 10%.

sensitivity_results = cell(2,2);

if run_sensitivity

    for k = 1:2

        for s = 1:2

            a = models{s};

            a.hgFactor = 1.20*a.hgFactor;
            a.hcFactor = 0.80*a.hcFactor;

            if k == 2
                a.kw = 0.90*a.kw;
            end

            a.name = sprintf( ...
                'Stage %d: adverse h, conductivity %.0f W/mK', ...
                s,a.kw);

            sensitivity_results{k,s} = ...
                solveEngine(a,props,n_segments);

            printResult(sensitivity_results{k,s},a);

        end

    end

end

%% Material comparison -- adopted CDR conductivities and screening limits

if run_material_trade

    names = {'GRCop-42','CuCrZr','NASA HR-1','Inconel 718'};

    % Adopted thermal conductivities [W/(m K)]
    conductivities = [300,324,25.8,22.2];

    % Adopted screening temperature limits [K]
    limits = [1000,773,922,978];

    fprintf('\nSTAGE 1 MATERIAL SCREENING\n');

    for j = 1:4

        a = models{1};
        a.kw = conductivities(j);

        r = solveEngine(a,props,n_segments);

        if r.valid

            fprintf( ...
                '%-12s Twg=%8.2f K; adopted margin=%8.2f K\n', ...
                names{j},r.Twg,limits(j)-r.Twg);

        else

            fprintf('%s: %s\n',names{j},r.message);

        end

    end

end

%% Nominal plots

if make_plots

    for s = 1:2

        r = results{s};

        if ~r.valid
            continue;
        end

        figure('Name',models{s}.name);

        colors = lines(3);

        for j = 1:3

            d = r.branches{j}.data;
            name = r.names{j};
            color = colors(j,:);

            subplot(2,2,1);
            hold on;

            plot(d(:,1),d(:,7),'-', ...
                'Color',color, ...
                'DisplayName',[name,' wall']);

            plot(d(:,1),d(:,5),'--', ...
                'Color',color, ...
                'DisplayName',[name,' coolant']);

            subplot(2,2,2);
            hold on;

            plot(d(:,1),d(:,9)/1e6, ...
                'Color',color,'DisplayName',name);

            subplot(2,2,3);
            hold on;

            plot(d(:,1),d(:,6)/1e6, ...
                'Color',color,'DisplayName',name);

            subplot(2,2,4);
            hold on;

            plot(d(:,1),d(:,10), ...
                'Color',color,'DisplayName',name);

        end

        titles = {
            'Wall and coolant temperatures'
            'Heat flux'
            'Coolant pressure before balancing'
            'Coolant velocity'
        };

        units = {
            'Temperature [K]'
            'q [MW/m^2]'
            'Pressure [MPa]'
            'Velocity [m/s]'
        };

        for j = 1:4

            subplot(2,2,j);

            grid on;
            title(titles{j});

            xlabel('Axial position from throat [m]');
            ylabel(units{j});

            legend('show','Location','best');

        end

    end

end

%% Local functions -- everything below stays in this same file

function r = solveEngine(a,p,n)

    r = struct('valid',false,'message','');

    try

        assert(all(a.fraction > 0) && ...
            abs(sum(a.fraction)-1) < 1e-10, ...
            'Invalid flow split.');

        assert(a.w < 2*pi*(a.Rt+a.tw)/a.N, ...
            'Channels overlap.');

        [x,y,s,Rf] = engineContour(a,n);

        rb = a.Rt*sqrt(a.split);
        mask = x >= 0;

        xb = interp1(y(mask),x(mask),rb);
        sb = interp1(x,s,xb);
        s0 = interp1(x,s,0);

        c = x < 0;
        nn = x > 0 & x < xb;
        e = x > xb;

        % Branch 1: throat toward chamber.
        % Branch 2: throat toward inner-nozzle outlet.
        % Branch 3: nozzle exit toward extension outlet.

        X = {
            flipud([x(c);0])
            [0;x(nn);xb]
            flipud([xb;x(e)])
        };

        Y = {
            flipud([y(c);a.Rt])
            [a.Rt;y(nn);rb]
            flipud([rb;y(e)])
        };

        S = {
            flipud([s(c);s0])
            [s0;s(nn);sb]
            flipud([sb;s(e)])
        };

        r.names = {'Chamber','Inner nozzle','Extension'};
        r.branches = cell(1,3);

        data = [];
        hout = 0;
        heat = 0;
        energy = 0;

        pressures = zeros(1,3);

        for j = 1:3

            b = coolingBranch( ...
                a,p,X{j},Y{j},S{j},Rf, ...
                a.mf*a.fraction(j),a.depth(j));

            r.branches{j} = b;

            data = [data;b.data]; %#ok<AGROW>

            pressures(j) = b.Pout;

            hout = hout+a.fraction(j)*b.hout;
            heat = heat+b.Q;
            energy = energy+b.mdot*(b.hout-b.hin);

        end

        % Ideal balancing restrictions are isenthalpic.
        r.Pout = min(pressures);
        r.balance = pressures-r.Pout;

        mix = statePH(p,r.Pout,hout);

        r.Tmix = mix.T;
        r.Q = heat;
        r.dP = a.Pin-r.Pout;

        r.energyResidual = (energy-heat)/max(heat,1);

        [r.Twg,j] = max(data(:,7));
        r.peak = data(j,:);

        r.Twc = max(data(:,8));
        r.qmax = max(data(:,9));

        % Chamber-side throat velocity.
        d = r.branches{1}.data;

        [~,j] = min(abs(d(:,1)));
        r.vthroat = d(j,10);

        r.thermalPass = r.Twg <= a.limit;
        r.pressurePass = r.Pout >= a.Prequired;

        r.valid = true;

    catch ME

        r.message = ME.message;

    end

end

function [x,y,s,Rf] = engineContour(a,n)

    L = a.Lit-a.Lcyl;
    dr = a.Rc-a.Rt;
    al = a.alpha;

    % Equal convergent fillets fitted to the fixed CDR geometry.
    Rf = (L*sin(al)-dr*cos(al))/(2*(1-cos(al)));

    x1 = -L+Rf*sin(al);
    y1 = a.Rc-Rf*(1-cos(al));

    x2 = -Rf*sin(al);
    y2 = a.Rt+Rf*(1-cos(al));

    assert(Rf > 0 && x2 >= x1 && y1 >= y2, ...
        'Invalid convergent geometry.');

    t = linspace(0,al,100)';

    x = [
        linspace(-a.Lit,-L,100)'
        -L+Rf*sin(t)
        linspace(x1,x2,100)'
        -Rf*sin(flipud(t))
    ];

    y = [
        a.Rc*ones(100,1)
        a.Rc-Rf*(1-cos(t))
        linspace(y1,y2,100)'
        a.Rt+Rf*(1-cos(flipud(t)))
    ];

    % Downstream throat arc and quadratic Bezier bell.
    xn = a.Rd*sin(a.tn);
    yn = a.Rt+a.Rd*(1-cos(a.tn));

    xq = (a.Re-yn+tan(a.tn)*xn-tan(a.te)*a.Lbell) / ...
        (tan(a.tn)-tan(a.te));

    yq = yn+tan(a.tn)*(xq-xn);

    assert(xq > xn && xq < a.Lbell, ...
        'Invalid bell tangent intersection.');

    t = linspace(0,a.tn,100)';
    u = linspace(0,1,400)';

    x = [
        x
        a.Rd*sin(t)
        (1-u).^2*xn+2*(1-u).*u*xq+u.^2*a.Lbell
    ];

    y = [
        y
        a.Rt+a.Rd*(1-cos(t))
        (1-u).^2*yn+2*(1-u).*u*yq+u.^2*a.Re
    ];

    keep = [true;diff(x) > 1e-12];

    x = x(keep);
    y = y(keep);

    s = [0;cumsum(hypot(diff(x),diff(y)))];

    % Include throat and cylinder/convergent junction as mesh nodes.
    sn = unique(sort([
        linspace(0,s(end),n+1)'
        interp1(x,s,0)
        interp1(x,s,-L)
    ]));

    y = interp1(s,y,sn);
    x = interp1(s,x,sn);
    s = sn;

end

function b = coolingBranch(a,p,x,y,s,Rf,md,depth)

    inlet = statePT(p,a.Pin,a.Tin);

    h = inlet.h;

    % Total coolant flow area at a given gas-wall radius.
    area = @(rad) ...
        a.N*a.w*(rad+a.tw)/(a.Rt+a.tw)*depth;

    v = md/(area(y(1))*inlet.rho);

    dpIn = a.Kin*inlet.rho*v^2/2;
    P = a.Pin-dpIn;

    Q = 0;
    friction = 0;
    acceleration = 0;

    data = zeros(numel(x)-1,15);

    for j = 1:numel(x)-1

        xx = (x(j)+x(j+1))/2;
        rad = (y(j)+y(j+1))/2;

        ds = abs(s(j+1)-s(j));
        AR = (rad/a.Rt)^2;

        g = a.gamma;

        % Isentropic area-Mach relation.
        fun = @(M) ...
            (1/M)*(2/(g+1)*(1+(g-1)*M^2/2))^ ...
            ((g+1)/(2*(g-1)))-AR;

        if abs(AR-1) < 1e-10

            M = 1;

        elseif xx >= 0

            M = fzero(fun,[1,15]);

        else

            M = fzero(fun,[1e-5,1]);

        end

        c = statePH(p,P,h);

        % Channel geometry.
        w = a.w*(rad+a.tw)/(a.Rt+a.tw);
        rib = 2*pi*(rad+a.tw)/a.N-w;

        Dh = 2*w*depth/(w+depth);

        % Coolant mass flux and velocity.
        G = md/area(rad);
        v = G/c.rho;

        % Coolant convection.
        Re = G*Dh/c.mu;
        Pr = c.cp*c.mu/c.k;

        assert(Re >= 1e4, ...
            'Coolant Reynolds number below turbulent correlation range.');

        Nu = 0.023*Re^0.8*Pr^0.4;
        hc = a.hcFactor*Nu*c.k/Dh;

        % Rib fin efficiency and effective coolant coefficient.
        mf = sqrt(2*hc/(a.kw*rib));
        eta = tanh(mf*depth)/(mf*depth);

        heff = hc*(w+2*eta*depth)/(2*pi*rad/a.N);

        % Gas recovery temperature.
        z = 1+(g-1)*M^2/2;

        Taw = a.T0*(1+a.Pr^(1/3)*(g-1)*M^2/2)/z;

        % Bartz gas-side coefficient before wall-temperature correction.
        base = a.hgFactor*0.026/(2*a.Rt)^0.2 * ...
            (a.mu^0.2*a.cp/a.Pr^0.6) * ...
            (a.md/a.At)^0.8 * ...
            (2*a.Rt/Rf)^0.1 * AR^(-0.9);

        hg = @(Tw) ...
            base*(0.5*Tw/a.T0*z+0.5)^(-0.68)*z^(-0.12);

        % Coupled wall temperature and heat flux.
        residual = @(Tw) ...
            Tw-c.T-(Taw-c.T)/ ...
            (1/hg(Tw)+a.tw/a.kw+1/heff)* ...
            (a.tw/a.kw+1/heff);

        Twg = fzero(residual,[c.T,Taw]);

        q = hg(Twg)*(Taw-Twg);
        Twc = Twg-q*a.tw/a.kw;

        % Segment heat pickup and next coolant enthalpy.
        dQ = q*2*pi*rad*ds;
        hn = h+dQ/md;

        % Haaland DARCY friction factor.
        f = (-1.8*log10( ...
            (a.rough/(3.7*Dh))^1.11+6.9/Re))^(-2);

        dpf = f*ds/Dh*G^2/(2*c.rho);

        % Iterated pressure-dependent acceleration contribution.
        vi = md/(area(y(j))*c.rho);

        Pn = P-dpf;
        converged = false;

        for it = 1:60

            out = statePH(p,Pn,hn);
            vo = md/(area(y(j+1))*out.rho);

            dpa = G*(vo-vi);
            target = P-dpf-dpa;

            if abs(target-Pn) < 1

                Pn = target;
                converged = true;
                break;

            end

            Pn = (Pn+target)/2;

        end

        assert(converged,'Pressure iteration did not converge.');

        % Columns:
        % x,r,M,Taw,Tbulk,P,Twg,Twc,q,v,hg,hc,heff,Re,Pr.
        data(j,:) = [
            xx,rad,M,Taw,c.T,P,Twg,Twc,q,v, ...
            hg(Twg),hc,heff,Re,Pr
        ];

        P = Pn;
        h = hn;

        Q = Q+dQ;
        friction = friction+dpf;
        acceleration = acceleration+dpa;

    end

    % Outlet minor loss.
    out = statePH(p,P,h);

    v = md/(area(y(end))*out.rho);

    dpOut = a.Kout*out.rho*v^2/2;

    P = P-dpOut;
    out = statePH(p,P,h);

    b = struct( ...
        'data',data, ...
        'mdot',md, ...
        'Q',Q, ...
        'Pout',P, ...
        'Tout',out.T, ...
        'hin',inlet.h, ...
        'hout',h, ...
        'friction',friction, ...
        'acceleration',acceleration, ...
        'minor',dpIn+dpOut);

end

function printResult(r,a)

    fprintf('\n%s\n',upper(a.name));

    if ~r.valid

        fprintf('INVALID/INCOMPLETE: %s\n',r.message);
        return;

    end

    for j = 1:3

        b = r.branches{j};

        fprintf([ ...
            '%s: mdot=%.3f kg/s, Q=%.3f MW, ', ...
            'Tout=%.2f K, Pout=%.3f MPa\n'], ...
            r.names{j},b.mdot,b.Q/1e6,b.Tout,b.Pout/1e6);

        fprintf([ ...
            '  dP: friction %.3f + acceleration %.3f ', ...
            '+ minor %.3f MPa\n'], ...
            b.friction/1e6,b.acceleration/1e6,b.minor/1e6);

        fprintf('  Additional balancing restriction: %.3f MPa\n', ...
            r.balance(j)/1e6);

    end

    fprintf([ ...
        'Peak Twg=%.2f K; wall margin=%.2f K; ', ...
        'THERMAL %s\n'], ...
        r.Twg,a.limit-r.Twg,passText(r.thermalPass));

    fprintf([ ...
        'Cooling dP=%.3f MPa; outlet pressure margin=%.3f MPa; ', ...
        'PRESSURE %s\n'], ...
        r.dP/1e6, ...
        (r.Pout-a.Prequired)/1e6, ...
        passText(r.pressurePass));

    fprintf([ ...
        'Total Q=%.3f MW; mixed Tout=%.2f K; ', ...
        'energy residual=%.2e\n'], ...
        r.Q/1e6,r.Tmix,r.energyResidual);

    d = r.peak;

    fprintf('Peak-wall station x=%.5f m, M=%.4f, Tb=%.2f K\n', ...
        d(1),d(3),d(5));

    fprintf([ ...
        'q=(%.2f-%.2f)/(1/%.2f+%.6f/%.1f+1/%.2f)', ...
        '=%.3f MW/m2\n'], ...
        d(4),d(5),d(11),a.tw,a.kw,d(13),d(9)/1e6);

    fprintf([ ...
        'Twc=Tb+q/heff=%.2f K; ', ...
        'Twg=Twc+q*t/k=%.2f K\n'], ...
        d(8),d(7));

end

function t = passText(condition)

    if condition
        t = 'PASS under assumptions';
    else
        t = 'FAIL under assumptions';
    end

end

function c = statePT(p,P,T)

    if P < p.P(1) || P > p.P(end) || ...
            T < p.T(1) || T > p.T(end)

        error([ ...
            'Methane outside table: P=%.3f MPa, T=%.2f K. ', ...
            'No extrapolation.'],P/1e6,T);

    end

    c = struct( ...
        'T',T, ...
        'h',p.H(T,P), ...
        'rho',p.rho(T,P), ...
        'mu',p.mu(T,P), ...
        'k',p.k(T,P), ...
        'cp',p.cp(T,P));

end

function c = statePH(p,P,h)

    if P < p.P(1) || P > p.P(end)

        error( ...
            'Methane pressure %.3f MPa outside the 30-60 MPa table.', ...
            P/1e6);

    end

    hs = p.H(p.T,P*ones(size(p.T)));

    if h < hs(1) || h > hs(end)

        error('Methane enthalpy outside the 110-625 K property table.');

    end

    T = interp1(hs,p.T,h,'linear');

    c = statePT(p,P,T);

end

function p = methaneTable()

    % Compact CoolProp 8.0.0 HEOS methane data.
    % Linear interpolation.
    % Bounds: 110-625 K and 30-60 MPa.
    % No extrapolation is permitted.
    %
    % Data columns:
    % h   [kJ/kg]
    % rho [kg/m3]
    % mu  [microPa s]
    % k   [W/(m K)]
    % cp  [kJ/(kg K)]
    %
    % Converted to SI below.
    %
    % EOS: Setzmann and Wagner (1991), J. Phys. Chem. Ref. Data.
    % https://coolprop.org/fluid_properties/fluids/Methane.html
    %
    % Bartz example: NASA NTRS 20120004103, PDF p.8.
    %
    % A numerical pass does not verify wall strength, surface finish,
    % radiation, transient behavior, manifold losses or full cycle closure.

    p.T = [
        110;120;140;160;180;200;220;240;260;
        280;300;320;340;360;380;400;420;440;
        460;480;500;520;540;560;580;600;625
    ];

    p.P = [30,40,51.2,60]*1e6;

    raw = [

        % P = 30 MPa; increasing temperature
        40.81830 446.91094 163.26388 0.2149246 3.273930;
        73.62099 435.58064 132.57990 0.2032755 3.286790;
        139.64595 412.43208 95.15729 0.1800074 3.317032;
        206.37601 388.45810 73.33862 0.1581246 3.358221;
        274.07120 363.49627 58.88664 0.1384387 3.413675;
        343.00264 337.49877 48.44732 0.1213366 3.480780;
        413.30756 310.65610 40.55766 0.1069272 3.548313;
        484.80249 283.54348 34.55684 0.0953539 3.595869;
        556.86178 257.14568 30.09375 0.0865540 3.601832;
        628.54221 232.60117 26.89572 0.0802433 3.558607;
        698.97106 210.75984 24.68984 0.0759759 3.480456;
        767.68966 191.92100 23.21273 0.0733049 3.391469;
        834.68765 175.92766 22.25098 0.0718789 3.310825;
        900.24653 162.39960 21.65046 0.0714389 3.248510;
        964.76873 150.91071 21.30403 0.0717892 3.207168;
        1028.66441 141.07604 21.13799 0.0727772 3.185455;
        1092.29895 132.57800 21.10171 0.0742833 3.180542;
        1155.97786 125.16453 21.16023 0.0762136 3.189407;
        1219.94891 118.63828 21.28910 0.0784945 3.209339;
        1284.41001 112.84485 21.47093 0.0810679 3.238071;
        1349.51806 107.66283 21.69315 0.0838876 3.273761;
        1415.39695 102.99593 21.94652 0.0869167 3.314935;
        1482.14414 98.76707 22.22411 0.0901254 3.360416;
        1549.83600 94.91392 22.52070 0.0934891 3.409263;
        1618.53203 91.38563 22.83224 0.0969877 3.460721;
        1688.27816 88.14028 23.15559 0.1006042 3.514182;
        1776.98992 84.42896 23.57268 0.1052693 3.583083;

        % P = 40 MPa; increasing temperature
        57.10106 452.76899 176.92650 0.2233659 3.240779;
        89.53401 442.11250 143.65326 0.2122118 3.245807;
        154.55227 420.60793 103.40689 0.1898694 3.256321;
        219.81332 398.76467 80.31985 0.1688534 3.270718;
        285.42207 376.54328 65.34750 0.1499716 3.291160;
        351.49222 353.99267 54.75581 0.1335563 3.316370;
        418.07990 331.28247 46.84306 0.1196656 3.341955;
        485.12940 308.72493 40.77817 0.1082954 3.361389;
        552.45156 286.75654 36.11203 0.0993169 3.368356;
        619.75915 265.86104 32.55495 0.0925095 3.359824;
        686.75262 246.45780 29.88269 0.0875789 3.337646;
        753.21244 228.81277 27.90606 0.0842038 3.307623;
        819.05256 213.01207 26.46559 0.0820864 3.276806;
        884.31888 198.99485 25.43248 0.0809809 3.251042;
        949.15270 186.61051 24.70730 0.0806962 3.233975;
        1013.74662 175.67022 24.21511 0.0810852 3.227167;
        1078.30848 165.98133 23.90003 0.0820336 3.230694;
        1143.03816 157.36570 23.72044 0.0834506 3.243775;
        1208.11544 149.66705 23.64536 0.0852628 3.265248;
        1273.69567 142.75218 23.65160 0.0874107 3.293863;
        1339.90965 136.50917 23.72172 0.0898453 3.328435;
        1406.86569 130.84457 23.84246 0.0925263 3.367905;
        1474.65241 125.68044 24.00364 0.0954201 3.411362;
        1543.34156 120.95169 24.19738 0.0984988 3.458032;
        1612.99075 116.60374 24.41752 0.1017389 3.507266;
        1683.64567 112.59064 24.65918 0.1051204 3.558523;
        1773.43234 107.98647 24.98567 0.1095205 3.624755;

        % P = 51.2 MPa; increasing temperature
        75.54227 458.75221 192.03906 0.2323675 3.212730;
        107.66480 448.70174 155.82145 0.2216748 3.211684;
        171.86429 428.62158 112.30065 0.2001460 3.208074;
        235.99307 408.52033 87.64382 0.1798206 3.205201;
        300.09370 388.39466 71.90400 0.1615069 3.205456;
        364.23374 368.30203 60.94421 0.1455143 3.209025;
        428.46822 348.36378 52.84110 0.1318862 3.214595;
        492.81703 328.76191 46.62800 0.1205687 3.220091;
        557.25783 309.72224 41.77814 0.1114159 3.223513;
        621.73601 291.48318 37.97207 0.1042297 3.223754;
        686.18818 274.25768 34.99037 0.0987781 3.221068;
        750.56888 258.20151 32.66634 0.0948155 3.216927;
        814.86978 243.39805 30.86683 0.0921043 3.213464;
        879.12649 229.86070 29.48413 0.0904314 3.212842;
        943.41403 217.54724 28.43169 0.0896163 3.216782;
        1007.83553 206.37854 27.64072 0.0895122 3.226363;
        1072.50924 196.25594 27.05706 0.0900016 3.242032;
        1137.55719 187.07438 26.63830 0.0909906 3.263745;
        1203.09687 178.73100 26.35124 0.0924040 3.291125;
        1269.23626 171.13002 26.16992 0.0941805 3.323612;
        1336.07115 164.18495 26.07397 0.0962700 3.360569;
        1403.68455 157.81921 26.04737 0.0986306 3.401357;
        1472.14693 151.96570 26.07742 0.1012275 3.445371;
        1541.51724 146.56610 26.15405 0.1040313 3.492063;
        1611.84406 141.56979 26.26919 0.1070167 3.540947;
        1683.16686 136.93291 26.41633 0.1101625 3.591596;
        1773.76836 131.58481 26.63732 0.1142923 3.656834;

        % P = 60 MPa; increasing temperature
        90.13767 463.10467 203.77965 0.2391662 3.195589;
        122.07115 453.45094 165.22346 0.2287866 3.190992;
        185.78108 434.27959 119.07436 0.2077862 3.179642;
        249.25519 415.24774 93.11695 0.1878766 3.168003;
        312.51748 396.35577 76.69709 0.1698734 3.158743;
        375.62719 377.65126 65.37056 0.1540825 3.152789;
        438.65013 359.22415 57.05455 0.1405484 3.149982;
        501.64282 341.19950 50.69108 0.1292072 3.149628;
        564.64622 323.72441 45.70130 0.1199147 3.150932;
        627.68752 306.94973 41.74035 0.1124858 3.153368;
        690.78814 291.01020 38.58187 0.1067135 3.156902;
        753.97389 276.00820 36.06303 0.1023837 3.161991;
        817.28323 262.00503 34.05895 0.0992890 3.169401;
        880.77105 249.02036 32.47055 0.0972392 3.179974;
        944.50812 237.03797 31.21822 0.0960671 3.194428;
        1008.57731 226.01471 30.23790 0.0956313 3.213243;
        1073.06834 215.88988 29.47809 0.0958144 3.236625;
        1138.07254 206.59348 28.89748 0.0965209 3.264535;
        1203.67842 198.05253 28.46297 0.0976727 3.296742;
        1269.96853 190.19533 28.14799 0.0992062 3.332893;
        1337.01760 182.95415 27.93124 0.1010693 3.372564;
        1404.89160 176.26660 27.79556 0.1032185 3.415311;
        1473.64762 170.07614 27.72711 0.1056178 3.460695;
        1543.33420 164.33218 27.71468 0.1082365 3.508301;
        1613.99192 158.98969 27.74914 0.1110488 3.557749;
        1685.65414 154.00878 27.82303 0.1140324 3.608698;
        1776.68496 148.23785 27.96163 0.1179737 3.674034;

    ];

    % Convert tabulated units to SI.
    raw(:,1) = raw(:,1)*1000;
    raw(:,3) = raw(:,3)*1e-6;
    raw(:,5) = raw(:,5)*1000;

    fields = {'H','rho','mu','k','cp'};

    for j = 1:5

        values = reshape(raw(:,j),numel(p.T),numel(p.P));

        p.(fields{j}) = griddedInterpolant( ...
            {p.T,p.P},values,'linear','none');

    end

end