import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseurl: string = "https://restcountries.com/v3.1";

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private http: HttpClient) { }

  get regions() {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url = `${this.baseurl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
      );

  }

  getCountryByAlphaCode(alphacode: string): Observable<SmallCountry> {

    const url = `${this.baseurl}/alpha/${alphacode}?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
      .pipe(
        map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      )
  }

  getCountryBordersByCode(borders:string[]):Observable<SmallCountry[]>{

    if(!borders || borders.length===0) return of([]);

    const countriesRequest:Observable<SmallCountry>[]= [];

    borders.forEach(code=>{
      const request = this.getCountryByAlphaCode(code);
      countriesRequest.push(request);
    })

    return combineLatest(countriesRequest);
  }
}
