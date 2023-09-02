﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using IHVNMedix.Models;
using IHVNMedix.Repositories;
using AutoMapper;
using IHVNMedix.DTOs;

namespace IHVNMedix.Controllers
{
    public class PatientsController : Controller
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMapper _mapper;

        public PatientsController(IPatientRepository patientRepository, IMapper mapper)
        {
            _patientRepository = patientRepository;
            _mapper = mapper;
        }

        // GET: Patients
        public async Task<IActionResult> Index()
        {
            var patients = await _patientRepository.GetAllPatientsAsync();
            var patientDtos = _mapper.Map<IEnumerable<DoctorDto>>(patients);
            return View(patientDtos);
        }

        // GET: Patients/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                return NotFound();
            }
            var patientDto = _mapper.Map<PatientDto>(patient);
            return View(patientDto);
            
        }

        // GET: Patients/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Patients/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,FirstName,LastName,DOB,Address,State,PhoneNumber,Gender")] Patient patient)
        {
            if (ModelState.IsValid)
            {
                await _patientRepository.AddPatientAsync(patient);
                return RedirectToAction(nameof(Index));
            }
            var patientDto = _mapper.Map<PatientDto>(patient);
            return View(patientDto);
        }

        // GET: Patients/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                return NotFound();
            }
            var patientDto = _mapper.Map<PatientDto>(patient);
            return View(patientDto);
        }

        // POST: Patients/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,FirstName,LastName,DOB,Address,State,PhoneNumber,Gender")] Patient patient)
        {
            if (id != patient.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    
                    await _patientRepository.UpdatePatientAsync(patient);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await PatientExistsAsync(patient.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            var patientDto = _mapper.Map<PatientDto>(patient);
            return View(patientDto);
        }

        // GET: Patients/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                return NotFound();
            }
            var patientDto = _mapper.Map<PatientDto>(patient);
            return View(patientDto);
        }

        // POST: Patients/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _patientRepository.DeletePatientAsync(id);
            return RedirectToAction(nameof(Index));
        }

        private async Task<bool>PatientExistsAsync(int id)
        {
            var patient = await _patientRepository.GetPatientByIdAsync(id); 
            return patient !=null;
        }
    }
}
