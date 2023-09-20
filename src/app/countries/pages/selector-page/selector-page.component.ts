import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { Subscription, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit, OnDestroy {

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  public countries: SmallCountry[] = [];
  public countriesborders: SmallCountry[] = [];
  private countrySubscripcion?: Subscription;
  private regionSubscripcion?: Subscription;

  constructor(private fb: FormBuilder, private countriesService: CountriesService) { }

  ngOnDestroy(): void {
    this.countrySubscripcion?.unsubscribe();
    this.regionSubscripcion?.unsubscribe();
  }

  ngOnInit(): void {
    this.onRegionChanges();
    this.onCountryChanges();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanges(): void {
    this.regionSubscripcion = this.myForm.get('region')?.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')?.setValue('')),
        tap(() => this.countriesborders = []),
        switchMap(region => this.countriesService.getCountriesByRegion(region))
      )
      .subscribe(countries => {
        this.countries = countries;
      });
  }

  onCountryChanges(): void {
    this.countrySubscripcion = this.myForm.get('country')?.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')?.setValue('')),
        filter((value: string) => value.length > 0),
        switchMap(alphacode => this.countriesService.getCountryByAlphaCode(alphacode)),
        switchMap(country => this.countriesService.getCountryBordersByCode(country.borders)),
        tap(
          countries => countries.length > 0 ?
            this._addValidators('border', Validators.required)
            : this._removeValidators('border', Validators.required)
        )
      )
      .subscribe(countries => {
        this.countriesborders = countries;
      });
  }

  private _removeValidators(field: string, validators: ValidatorFn | ValidatorFn[]) {
    this.myForm.controls[field].removeValidators(validators);
    this._updateValueAndValidity(field);
  }

  private _addValidators(field: string, validators: ValidatorFn | ValidatorFn[]) {
    this.myForm.controls[field].addValidators(validators);
    this._updateValueAndValidity(field);
  }

  private _updateValueAndValidity(field: string) {
    this.myForm.controls[field].updateValueAndValidity();
  }

}
