import React, { Component } from "react";
import * as Forge from "ed-forge";
import { getShipMetaProperty, getShipProperty } from "ed-forge/lib/data/ships";
import { FORGE_SHIPS } from "../utils/Constants";
import { Link } from "react-router-dom";
import cn from "classnames";
export const SizeMap = ["", "small", "medium", "large", "capital"];

const sortShips = () => {};
const translate = args => args;
const hide = args => args;
const termtip = args => args;
const units = {};
const formats = {
	round: val => Math.round(val),
	f1: val => val,
	int: val => val
};

/**
 * Generate Ship summary and aggregated properties
 * @param  {String} shipId   Ship Id
 * @return {Object}          Ship summary and aggregated properties
 */
function shipSummary(shipId) {
	let forgeShip;
	try {
		forgeShip = Forge.Factory.newShip(shipId);
	} catch (e) {
		console.error(e);
	}
	let summary = {
		id: shipId,
		hpCount: 0,
		intCount: 0,
		maxCargo: 0,
		maxPassengers: 0,
		hp: [0, 0, 0, 0, 0], // Utility, Small, Medium, Large, Huge
		int: [0, 0, 0, 0, 0, 0, 0, 0], // Sizes 1 - 8
		standard: forgeShip.getCoreModules().map(e => {
			console.log(e);
			return 0; //e.getClass();
		}),
		agility:
			forgeShip.readProp("pitch") +
			forgeShip.readProp("yaw") +
			forgeShip.readProp("roll")
		// shipData.properties.pitch +
		// shipData.properties.yaw +
		// shipData.properties.roll
	};
	Object.assign(summary);
	// Build Ship
	return summary;
}
class ShipTable extends Component {
	static cachedSummaries = null;

	constructor(props) {
		super(props);
		if (!ShipTable.cachedShipSummaries) {
			ShipTable.cachedShipSummaries = [];
			for (let s of FORGE_SHIPS) {
				ShipTable.cachedShipSummaries.push(shipSummary(s));
			}
		}
		this.state = {
			shipRows: [],
			shipPredicate: "name",
			shipDesc: true,
			detailRows: []
		};
	}

	/**
	 * Update state with the specified sort predicates
	 * @param  {String} shipPredicate      Sort predicate - property name
	 * @param  {number} shipPredicateIndex Sort predicate - property index
	 */
	_sortShips(shipPredicate, shipPredicateIndex) {
		let shipDesc = this.state.shipDesc;

		if (typeof shipPredicateIndex == "object") {
			shipPredicateIndex = undefined;
		}

		if (
			this.state.shipPredicate === shipPredicate &&
			this.state.shipPredicateIndex === shipPredicateIndex
		) {
			shipDesc = !shipDesc;
		}

		this.setState({ shipPredicate, shipDesc, shipPredicateIndex });
	}

	componentWillMount() {
		this._genShipRows();
	}

	_genShipRows() {
		const shipRows = [];
		const detailRows = [];
		for (const shipName of FORGE_SHIPS) {
			let ship;
			try {
				ship = Forge.Factory.newShip(shipName);
			} catch (e) {
				console.error(e);
			}
			let name = shipName;
			detailRows.push(
				this._shipRowElement(
					ship,
					translate,
					units,
					formats.int,
					formats.f1
				)
			);
			shipRows.push(
				<tr
					key={shipName}
					style={{ height: "1.5em" }}
					className={cn({
						highlighted: this.state.shipId === shipName,
						alt: null
					})}
				>
					<td className="le">
						<Link to={"/outfit/" + shipName}>{name}</Link>
					</td>
				</tr>
			);
			this.setState({ shipRows, detailRows });
		}
	}

	/**
	 * Generate the table row summary for the ship
	 * @param  {Object} s           Ship summary
	 * @param  {Function} translate Translate function
	 * @param  {Object} u           Localized unit map
	 * @param  {Function} fInt      Localized integer formatter
	 * @param  {Function} fRound    Localized round formatter
	 * @return {React.Component}    Table Row
	 */
	_shipRowElement(s, translate, u, fInt, fRound) {
		let noTouch = this.context.noTouch;
		const hps = s.getHardpoints(null, true).map(hp => hp.getSize());
		const hpCounts = {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0
		};
		hps.forEach(function(v) {
			if (hpCounts[v]) {
				hpCounts[v]++;
			} else {
				hpCounts[v] = 1;
			}
		});

		const ints = s.getInternals(null, true).map(int => int.getSize());
		const intCounts = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0,
			7: 0,
			8: 0
		};
		ints.forEach(function(v) {
			if (intCounts[v]) intCounts[v]++;
			else intCounts[v] = 1;
		});

		return (
			<tr
				style={{ height: "1.5em" }}
				className={cn({
					highlighted: noTouch && this.state.shipId === s.id
				})}
				onMouseEnter={noTouch && this._highlightShip.bind(this, s.id)}
			>
				<td className="ri">{s.readMeta("manufacturer")}</td>
				<td className="ri">{fInt(s.readMeta("retailCost"))}</td>
				<td className="ri cap">
					{translate(SizeMap[s.readMeta("class")])}
				</td>
				<td className="ri">{fInt(s.readMeta("crew"))}</td>
				<td className="ri">{s.readProp("masslock")}</td>
				<td className="ri">
					{fInt(
						s.readProp("pitch") +
							s.readProp("yaw") +
							s.readProp("roll")
					)}
				</td>
				<td className="ri">{fInt(s.readProp("hardness"))}</td>
				<td className="ri">{fInt(s.readProp("hullmass"))}</td>
				<td className="ri">{fInt(s.get("speed"))}</td>
				<td className="ri">{fInt(s.get("boost"))}</td>
				<td className="ri">{fInt(s.get("basearmour"))}</td>
				<td className="ri">{fInt(s.get("baseshieldstrength"))}</td>
				<td className="ri">{fInt(s.topSpeed)}</td>
				<td className="ri">{fInt(s.topBoost)}</td>
				<td className="ri">{fRound(s.maxJumpRange)}</td>
				<td className="ri">{fInt(s.maxCargo)}</td>
				<td className="ri">{fInt(s.maxPassengers)}</td>
				<td className="cn">{s.getPowerPlant().getSize()}</td>
				<td className="cn">{s.getThrusters().getSize()}</td>
				<td className="cn">{s.getFSD().getSize()}</td>
				<td className="cn">{s.getLifeSupport().getSize()}</td>
				<td className="cn">{s.getPowerDistributor().getSize()}</td>
				<td className="cn">{s.getSensors().getSize()}</td>
				<td className="cn">{s.getCoreFuelTank().getSize()}</td>
				<td className={cn({ disabled: !hpCounts[1] })}>
					{hpCounts[1]}
				</td>
				<td className={cn({ disabled: !hpCounts[2] })}>
					{hpCounts[2]}
				</td>
				<td className={cn({ disabled: !hpCounts[4] })}>
					{hpCounts[3]}
				</td>
				<td className={cn({ disabled: !hpCounts[4] })}>
					{hpCounts[4]}
				</td>
				<td className={cn({ disabled: !hpCounts[0] })}>
					{hpCounts[0]}
				</td>
				<td className={cn({ disabled: !intCounts[1] })}>
					{intCounts[1]}
				</td>
				<td className={cn({ disabled: !intCounts[2] })}>
					{intCounts[2]}
				</td>
				<td className={cn({ disabled: !intCounts[3] })}>
					{intCounts[3]}
				</td>
				<td className={cn({ disabled: !intCounts[4] })}>
					{intCounts[4]}
				</td>
				<td className={cn({ disabled: !intCounts[5] })}>
					{intCounts[5]}
				</td>
				<td className={cn({ disabled: !intCounts[6] })}>
					{intCounts[6]}
				</td>
				<td className={cn({ disabled: !intCounts[7] })}>
					{intCounts[7]}
				</td>
				<td className={cn({ disabled: !intCounts[8] })}>
					{intCounts[8]}
				</td>
			</tr>
		);
	}

	_highlightShip() {}

	render() {
		let sortShips = (predicate, index) =>
			this._sortShips.bind(this, predicate, index);
		return (
			<div>
				<div
					style={{
						whiteSpace: "nowrap",
						margin: "0 auto",
						fontSize: "0.8em",
						position: "relative",
						display: "inline-block",
						maxWidth: "100%"
					}}
				>
					<table
						style={{
							width: "13em",
							position: "absolute",
							zIndex: 1
						}}
					>
						<thead>
							<tr>
								<th className="le rgt">&nbsp;</th>
							</tr>
							<tr className="main">
								<th
									className="sortable le rgt"
									onClick={sortShips("name")}
								>
									{translate("ship")}
								</th>
							</tr>
							<tr>
								<th className="le rgt">&nbsp;</th>
							</tr>
						</thead>
						<tbody
							onMouseLeave={this._highlightShip.bind(this, null)}
						>
							{this.state.shipRows}
						</tbody>
					</table>
					<div style={{ overflowX: "scroll", maxWidth: "100%" }}>
						<table
							style={{
								marginLeft: "calc(13em - 1px)",
								zIndex: 0
							}}
						>
							<thead>
								<tr className="main">
									<th
										rowSpan={3}
										className="sortable"
										onClick={sortShips("manufacturer")}
									>
										{translate("manufacturer")}
									</th>
									<th>&nbsp;</th>
									<th
										rowSpan={3}
										className="sortable"
										onClick={sortShips("class")}
									>
										{translate("size")}
									</th>
									<th
										rowSpan={3}
										className="sortable"
										onClick={sortShips("crew")}
									>
										{translate("crew")}
									</th>
									<th
										rowSpan={3}
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"mass lock factor"
										)}
										onMouseLeave={hide}
										onClick={sortShips("masslock")}
									>
										{translate("MLF")}
									</th>
									<th
										rowSpan={3}
										className="sortable"
										onClick={sortShips("agility")}
									>
										{translate("agility")}
									</th>
									<th
										rowSpan={3}
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"hardness"
										)}
										onMouseLeave={hide}
										onClick={sortShips("hardness")}
									>
										{translate("hrd")}
									</th>
									<th>&nbsp;</th>
									<th colSpan={4}>{translate("base")}</th>
									<th colSpan={5}>{translate("max")}</th>
									<th className="lft" colSpan={7} />
									<th className="lft" colSpan={5} />
									<th className="lft" colSpan={8} />
								</tr>
								<tr>
									<th
										className="sortable lft"
										onClick={sortShips("retailCost")}
									>
										{translate("cost")}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("hullMass")}
									>
										{translate("hull")}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("speed")}
									>
										{translate("speed")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("boost")}
									>
										{translate("boost")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("baseArmour")}
									>
										{translate("armour")}
									</th>
									<th
										className="sortable"
										onClick={sortShips(
											"baseShieldStrength"
										)}
									>
										{translate("shields")}
									</th>

									<th
										className="sortable lft"
										onClick={sortShips("topSpeed")}
									>
										{translate("speed")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("topBoost")}
									>
										{translate("boost")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("maxJumpRange")}
									>
										{translate("jump")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("maxCargo")}
									>
										{translate("cargo")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("maxPassengers")}
										onMouseEnter={termtip.bind(
											null,
											"passenger capacity"
										)}
										onMouseLeave={hide}
									>
										{translate("pax")}
									</th>
									<th className="lft" colSpan={7}>
										{translate("core module classes")}
									</th>
									<th
										colSpan={5}
										className="sortable lft"
										onClick={sortShips("hpCount")}
									>
										{translate("hardpoints")}
									</th>
									<th
										colSpan={8}
										className="sortable lft"
										onClick={sortShips("intCount")}
									>
										{translate("internal compartments")}
									</th>
								</tr>
								<tr>
									<th
										className="sortable lft"
										onClick={sortShips("retailCost")}
									>
										{units.CR}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("hullMass")}
									>
										{units.T}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("speed")}
									>
										{units["m/s"]}
									</th>
									<th
										className="sortable"
										onClick={sortShips("boost")}
									>
										{units["m/s"]}
									</th>
									<th>&nbsp;</th>
									<th
										className="sortable"
										onClick={sortShips(
											"baseShieldStrength"
										)}
									>
										{units.MJ}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("topSpeed")}
									>
										{units["m/s"]}
									</th>
									<th
										className="sortable"
										onClick={sortShips("topBoost")}
									>
										{units["m/s"]}
									</th>
									<th
										className="sortable"
										onClick={sortShips("maxJumpRange")}
									>
										{units.LY}
									</th>
									<th
										className="sortable"
										onClick={sortShips("maxCargo")}
									>
										{units.T}
									</th>
									<th>&nbsp;</th>
									<th
										className="sortable lft"
										onMouseEnter={termtip.bind(
											null,
											"power plant"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 0)}
									>
										{"pp"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"thrusters"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 1)}
									>
										{"th"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"frame shift drive"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 2)}
									>
										{"fsd"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"life support"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 3)}
									>
										{"ls"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"power distriubtor"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 4)}
									>
										{"pd"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"sensors"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 5)}
									>
										{"s"}
									</th>
									<th
										className="sortable"
										onMouseEnter={termtip.bind(
											null,
											"fuel tank"
										)}
										onMouseLeave={hide}
										onClick={sortShips("standard", 6)}
									>
										{"ft"}
									</th>
									<th
										className="sortable lft"
										onClick={sortShips("hp", 1)}
									>
										{translate("S")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("hp", 2)}
									>
										{translate("M")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("hp", 3)}
									>
										{translate("L")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("hp", 4)}
									>
										{translate("H")}
									</th>
									<th
										className="sortable"
										onClick={sortShips("hp", 0)}
									>
										{translate("U")}
									</th>

									<th
										className="sortable lft"
										onClick={sortShips("int", 0)}
									>
										1
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 1)}
									>
										2
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 2)}
									>
										3
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 3)}
									>
										4
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 4)}
									>
										5
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 5)}
									>
										6
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 6)}
									>
										7
									</th>
									<th
										className="sortable"
										onClick={sortShips("int", 7)}
									>
										8
									</th>
								</tr>
							</thead>
							<tbody
								onMouseLeave={this._highlightShip.bind(
									this,
									null
								)}
							>
								{this.state.detailRows}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}

export default ShipTable;
