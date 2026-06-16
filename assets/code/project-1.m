clear; clc; close all;

%% ====================== Q1: Coupled ODE system (ode45) ======================
% State: z = [x; xdot; y]
tspan = [0 10];
z0    = [-2; 3; 1];   % [x(0); xdot(0); y(0)]

f = @(t,z) [ z(2);            % xdot
             z(2) - 2*z(3);   % xddot = xdot - 2*y
             z(2) ];          % ydot = xdot

opts = odeset('RelTol',1e-9,'AbsTol',1e-12);
[t,z] = ode45(f, tspan, z0, opts);

x    = z(:,1);
xdot = z(:,2);
y    = z(:,3);

% Plot: x(t) and y(t)
figure('Color','w'); grid on; hold on; box on;
plot(t, x, 'LineWidth',1.6, 'DisplayName','x(t)')
plot(t, y, 'LineWidth',1.6, 'DisplayName','y(t)')
xlabel('t (s)'); ylabel('State value');
title('Q1: Numerical solution of coupled system');
legend('Location','best');

% Parameters
m = 1;      % kg
L = 2;      % m
g = 9.81;   % m/s^2

% Choose damping so amplitude ratio per cycle r = 0.95
r = 0.95;
delta = -log(r);                               % logarithmic decrement
rootFun = @(z) 2*pi*z./sqrt(1 - z.^2) - delta; % solve for damping ratio zeta
zeta = fzero(rootFun, 0.01);
wn   = sqrt(g/L);                               % natural frequency (rad/s)
b    = 2*zeta*wn*m*L^2;                         % viscous damping N·m·s/rad
fprintf('Q2 damping: zeta=%.6f,  b=%.6f N·m·s/rad\n', zeta, b);

% ODE for pendulum: state zp = [theta; thetadot]
pend = @(t,zp)[ zp(2);
               -(b/(m*L^2))*zp(2) - (g/L)*sin(zp(1)) ];

% Initial condition: small perturbation around (pi, 0)
theta0  = pi + deg2rad(3);
thetad0 = 0;
z0p = [theta0; thetad0];

Tf = 30;
[tP, zP] = ode45(pend, [0 Tf], z0p, opts);
theta  = zP(:,1);
thetad = zP(:,2);

% Wrap theta for readability into [-pi, pi]
th_wrap = mod(theta + pi, 2*pi) - pi;

% Plot: theta(t) and theta_dot(t)
figure('Color','w'); tiledlayout(2,1);
nexttile; grid on; box on;
plot(tP, th_wrap, 'LineWidth',1.6);
ylabel('\theta (rad)');
title('Q2: Damped pendulum near (\pi, 0) with ~5% amplitude loss / cycle');

nexttile; grid on; box on;
plot(tP, thetad, 'LineWidth',1.6);
ylabel('\thetȧ (rad/s)'); xlabel('t (s)');

