import { GetStaticProps } from "next"
import { useEffect, useState } from "react"
import {api} from '../services/api'

import styles from './styles/index.module.sass'

type Starship = {
	id: number,
	name: string,
	mglt: number,
	consumables: number,
}

type HomeProps = {
	starships: Starship[]
}

export default function Home({starships}: HomeProps ) {

	const [starship, setStarship] = useState({id: -1, name: '', mglt: 0, consumables: 0} as Starship)
	const [distance, setDistance] = useState(1000000)
	const [stops, setStops] = useState(0)

	function recalculateDistance () {
		if (starship.mglt !== NaN || starship.id !== -1 || starship.consumables !== NaN) {
			var calc = Math.floor((distance/starship.mglt) / starship.consumables)
			setStops(calc)
		}
	}

	useEffect(recalculateDistance, [starship, distance])

	return (
		<div className={`pagesContainer`} >
			<header className={styles.header}>
				<h1>Star Calculator</h1>
			</header>

			<main className={`${styles.mainContainer} elementContainer`}>
				<nav className={styles.options}>
					<div>
						<label htmlFor="starships">Select your starship:</label>
						<select
						  id="starships"
						  value={starship.id}
						  onChange={(e) => {setStarship(starships[e.target.value])}}
						  name="starships"
						>
							{ starship.id === -1 && <option value="">Select your starship</option> }
							{starships.map((starship) => {
								return <option value={starship.id} key={starship.id}>{starship.name}</option>
							})}
						</select>
					</div>
					<div>
						<label htmlFor="distance">Insert a distance in mega light:</label>
						<input
						  name="distance"
						  type="number"
						  value={distance}
						  onChange={(e) => setDistance(Number(e.target.value))}
						/>
					</div>
				</nav>

				<section className={styles.result}>
					<img src="spaceship.svg" alt="SpaceShip"/>
					<h2>{starship.id !== -1 ? stops === Infinity?`${starship.name}: no informations`: `${starship.name}: ${stops} stops`: "Select your starship"}</h2>
				</section>
			</main>

		</div>
	)
}

function convertTimeToHours (consumables: string) {

	const [value, time] = consumables.split(' ')

	if (time === 'year' || time === 'years') {
		return Number(value) * 365 * 24
	} else if (time === 'month' || time === 'months') {
		return Number(value) * 30 * 24
	} else if (time === 'week' || time === 'weeks') {
		return Number(value) * 7 * 24
	} else if (time === 'day' || time === 'days') {
		return Number(value) * 24
	} else {
		return NaN
	}
}

export const getStaticProps: GetStaticProps = async () => {

	const {data: {count}} = await api.get('starships/')
	var results = []

	for (let i = 1; i <= Math.round(count/10); i++) {
		var {data: {results: pageResults}} = await api.get(`starships/?page=${i}`)
		results = [...results, ...pageResults]
	}
	
	const starships = results.map((starship, id) => {
		return {
			id,
			name: starship.name,
			mglt: Number(starship.MGLT),
			consumables: convertTimeToHours(starship.consumables)
		}
	})

	return {
        props: {
			starships
		},
        revalidate: 60 * 60 * 8
    }
}